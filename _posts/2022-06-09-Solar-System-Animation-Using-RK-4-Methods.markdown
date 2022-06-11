---
layout: post
title:  "Solar System Simulation Using Runge-Kutta Methods: An Implementation in Python and C"
date:   2022-06-09 23:40:01 -0500
categories: Blog Post
---

![simulation]({{ site.url }}{{ site.baseurl }}/image2.png){:style="display:block; margin-left:auto; margin-right:auto"}

# Introduction

In this project, I extend code I found online into a fully functional solar system simulator which makes videos using matplotlib and ffmpeg. For more about the project and a full code review, you can check out my [youtube channel](https://www.youtube.com/watch?v=zaXbZnTdT7U). My main source for this project was [this](https://prappleizer.github.io/Tutorials/RK4/RK4_Tutorial.html) tutorial on github pages. It is a great read, and I definitely recommend it if you are interested in astrodynamical simulations. In what follows, I will give an introduction to the various methods used in this project. I will wrap up with a simple sample simulation. For a list of the necessary imports see my [github](https://github.com/ctgallagher4/solar_system_animate). There is also some other setup for the C wrapper including the actual c code and .so file so don't just copy and paste the code and expect this to work! This is just a high level overview. You may also need to install some dependencies like astropy. You can do this with pip. Python should make it clear what dependencies are missing when you try to run a sample simulation.

# The Body Class

This is a simple class to store planetary bodies as a position vector, a velocity vector, a mass, and a name within a body object. It comes with two methods besides the initialization method: return_vector() and return_masses which return the position vector and the objects mass respectively.

{% highlight python %}
class Body:
    '''A class for working with bodies of all masses.'''
    def __init__(self, pos_vec, vel_vec, mass, name):
        '''Initializes name as well as position, velocity, and mass vectors.'''
        self.pos = pos_vec.cgs.value
        self.vel = vel_vec.cgs.value
        self.mass = mass.cgs.value
        self.name = name

    def return_vector(self):
        '''Concatenates position and velocity into one vector and returns'''
        return np.concatenate((self.pos, self.vel))

    def return_masses(self):
        '''Returns a body's mass'''
        return self.mass
{% endhighlight %}

# The System Class

This is a more complicated class with a variety of methods. First we have the initializer method which loads in data from our configuration csv and initializes some variables for our simulation like the step size, the acceleration constant, and a list of body objects. This method also initializes the system state vector and the system mass vector. These are numpy arrays which store the position state and velocity state of the system of bodies and the mass vector of all the bodies respectively for a given system. 

Secondly, we have the evaluator method which is a thin wrapper for the c function - gravity evaluator (explained in more detail [here](https://www.youtube.com/watch?v=zaXbZnTdT7U)). This function takes in the state vectors and mass vectors and returns the accelerations in O(n^2) time. This "brute force" approach is necessary for a small number of bodies orbiting close together on the scale of a few AU, but it is easy to see how we could probably make certain assumptions about graviatational pulls between planets at the opposite sides of galaxies, something this code could easily be updated to do. You would probably have to generate the configuration csv with a great many bodies and implement some sort of collision handling. This method is essentially the same code as is in the aforementioned tutorial; however, I have rewritten it in C from python for speed as calculating the accelerations in O(n^2) time is a large bottleneck.

Thirdly, we have the rk4 method. This is taken almost verbatim from the tutorial with some minor updates to use our wrapped c function for the accelerations. RK4 takes in our system vectors runs RK-4 methods with our acceleration evaluator and spits out the new system vector.

Next, we have the run simulation and transpose history methods. The run simulation method simply runs the simulation by appending to a list of system state vectors and updating the current system state vector for each time step. This history is stored in the self.past list. Now we have a problem in that the self.past list is just a list of system state vectors. These vectors must be transposed in order to plot them as arrays in matplotlib. Additionally, we need to drop the velocity vectors, hence the floor division by 2.

This brings us to the plot and save video methods. These methods plot the transposed history and then animate it using matplotlib and ffmpeg. These come with built in parameters for selecting whether or not you want the frame to rotate, expand or contract as bodies move out of view, and/or skip frames when rendering for improved speed or as a fast-forward. This method gets a little complicated so I will refer you once again to the video.

{% highlight python %}

class System:
    '''A class to work with systems of bodies.'''
    def __init__(self, data, step_size=1, G=9.81):
        '''Initializes data step size and G constant'''
        self.step_size = step_size
        self.acceleration_constant = G * u.m/(u.s**2)
        self.bodies = []

        #reads in data from a CSV file
        with open(data) as csvfile:
            reader = csv.reader(csvfile, delimiter=',')
            for row in reader:
                pos_vec = np.array([float(i) for i in row[0].split()])
                vel_vec = np.array([float(i) for i in row[1].split()])
                mass = float(row[2])
                name = str(row[3])
                body = Body(pos_vec * u.AU, vel_vec *u.km/u.s, mass*c.M_earth, name)
                self.bodies.append(body)

        #combines each individual body vector into a single large list
        state_vectors = np.array([body.return_vector() for body in self.bodies], dtype=object)
        #combines each item in the list into a single long array
        self.system_state_vector = np.concatenate(state_vectors, dtype=object)
        #returns a large vector containing all of the body masses
        self.system_mass_vector = np.array([body.return_masses() for body in self.bodies])

    def evaluator(self, t, y, m):
        '''A wrapper for the C function grav_evaluator that returns accelerations'''
        n = len(y)
        y = list(y)
        m = list(m)
        c_arr_in = (c_double * n)(*y)
        c_arr_in_2 = (c_double * n)(*m)
        c_arr_out = (c_double * n)()
        grav_eval(n, c_arr_in, c_arr_in_2, c_arr_out)
        return np.asarray(list(c_arr_out[:]))


    def rk4(self, t, dt):
        '''A Runge-Kutta methods calculator'''
        func = self.evaluator
        y = self.system_state_vector
        m = self.system_mass_vector
        k1 = dt * func(t, y, m) 
        k2 = dt * func(t + 0.5*dt, y + 0.5*k1, m)
        k3 = dt * func(t + 0.5*dt, y + 0.5*k2, m)
        k4 = dt * func(t + dt, y + k3, m)
        new = y + (1/6.)*(k1+ 2*k2 + 2*k3 + k4)

        return new

    def run_simulation(self, T, dt, t0=0):
        '''A method to run the simulation'''
        self.total_time = T 
        self.time_step = dt
        clock = (t0 * T.unit).cgs.value
        T = T.cgs.value
        dt = dt.cgs.value
        num_steps = int((T-t0)/dt)
        self.past = []
        print("Running Simulation:")
        for step in tqdm(range(num_steps)):
            self.past.append(self.system_state_vector)
            self.system_state_vector = self.rk4(clock, dt)
            clock += dt

    def transpose_history(self):
        '''A method to convert self.past to a matplotibable format'''
        transposed = []
        for y in self.past:
            split = np.split(y, len(y) / 3)
            if len(transposed) == 0:
                transposed = [[[], [], []] for i in range(len(split) // 2)]

            for i in range(0, len(split), 2):
                transposed[i // 2][0].append(split[i][0])
                transposed[i // 2][1].append(split[i][1])
                transposed[i // 2][2].append(split[i][2])
        return transposed

    def plot(self, history, box_length):
        '''Uses transposed history to plot'''
        ax = plt.axes(projection='3d')
        ax.set_xlim(-1*box_length, box_length)
        ax.set_ylim(-1*box_length, box_length)
        ax.set_zlim(-1*box_length, box_length)
        ax.set_xlabel('Centimeters')
        ax.set_ylabel('Centimeters')
        ax.set_zlabel('Centimeters')
        ax.view_init(20, 0)
        for object in history:
            ax.plot3D(object[0], object[1], object[2])

        plt.show()
        plt.clf()

    def save_video(self, history, box_length, video_name, rotate=0, fixed='no', frame_skip=1):
        '''Saves the transposed history to a short video'''
        fig = plt.figure()
        ax = plt.axes(projection ='3d')
        ax.set_xlabel('Centimeters')
        ax.set_ylabel('Centimeters')
        ax.set_zlabel('Centimeters')
        labels = [i.name for i in self.bodies]
        FFMpegWriter = manimation.writers['ffmpeg']
        metadata = dict(title=f'{video_name}', 
                        artist='Matplotlib',
                        comment='gravity simulation')
        writer = FFMpegWriter(fps=15, metadata=metadata)
        with writer.saving(fig, f"{video_name}.mp4", 100):
            print("Creating Video:")
            for frame_num in tqdm(range(0, len(self.past), frame_skip)):
                for i, body in enumerate(history):
                    ax.plot3D(body[0][:frame_num], body[1][:frame_num], body[2][:frame_num])
                    ax.scatter(body[0][frame_num], body[1][frame_num], body[2][frame_num])
                    ax.text3D(body[0][:frame_num+1][-1], 
                            body[1][:frame_num+1][-1], 
                            body[2][:frame_num+1][-1], 
                            labels[i], 
                            color='black',
                            size = 15)
                    if fixed == 'yes':
                        ax.set_xlim(-1*box_length, box_length)
                        ax.set_ylim(-1*box_length, box_length)
                        ax.set_zlim(-1*box_length, box_length)
                    ax.set_xlabel('Centimeters')
                    ax.set_ylabel('Centimeters')
                    ax.set_zlabel('Centimeters')
                ax.view_init(20, rotate*frame_num* 1/frame_skip)
                time = round(frame_num * self.time_step.unit.to('yr'), 2)
                ax.set_title(f'{time} years')
                writer.grab_frame()
                plt.cla()

{% endhighlight %}

# A Simple Sample Simulation

Now I will transition to explaining how to run a brief simulation. First, you can install and run a sample simulation with:
{% highlight bash %}
git clone https://github.com/ctgallagher4/solar_system_animate
cd solar_system_animate
python3 simulation.py
{% endhighlight %}
This first loads a system object and populates it with the data from 'sample_binary_star.csv'. This file is easy to edit and explained in more detail in the video (just make sure not to leave a blank line at the bottom or the program will implode). Next, it runs the simulation for 4 years with a time step of one day. Then, it saves the history and plots it with a window of 1.5 AU (astronomical units). Finally, we save the video with an initial window of 1 AU, save to binary_star.mp4, set the rotation speed to 1/3, set the window to be fixed (the video will not expand beyond 1.5 AU), and set frame_skip=1 (this means we will skip no frames when we render the video).

{% highlight python %}

from simulation_module import *

if __name__=='__main__':

    simulation_system = System(path.join(sys.path[0], 'sample_binary_star.csv'))

    simulation_system.run_simulation(4*u.year, 1*u.day)
    history = simulation_system.transpose_history()
    simulation_system.plot(history, (1.5*u.AU).cgs.value)
    simulation_system.save_video(history,
                                (1*u.AU).cgs.value, 
                                'binary_star2', 
                                rotate=1/3,
                                fixed='yes',
                                frame_skip=1)

{% endhighlight %}

# Conclusion
You can view the rest of the code you need to get this running as well as some sample csv files on my
[github](https://github.com/ctgallagher4/solar_system_animate). Feel free to submit a PR, and I will add you to a list of contributors. You can also send me an email below. Do not forget to check out the original [tutorial](https://prappleizer.github.io/Tutorials/RK4/RK4_Tutorial.html)!