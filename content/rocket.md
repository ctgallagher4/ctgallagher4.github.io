# The Math Behind Rocket

If you have taken high school trig, you know enough to build something like
Asteroids in Rust, but just in case you've mixed up sin and cos over the
years, I decided to make this page to explain. This page will mostly focus
on drawing, but I will also touch on basic mechanics. In other words,
how do you get a basic acceleration effect, and how do you keep movement
frame rate independent?

## Drawing The Player

Checking out the implementation of `Drawable` for `Player` in `player.rs` we have:

```Rust
fn draw(&mut self, canvas: &mut Canvas<Window>) {
    let top_x = self.x + self.bearing.cos() * SHIP_SIZE;
    let top_y = self.y + self.bearing.sin() * SHIP_SIZE;

    let top = FPoint::new(top_x.round(), top_y.round());
    let bot_left = calculate_point(self.x, self.y, self.bearing, 200.0);
    let bot_right = calculate_point(self.x, self.y, self.bearing, 160.0);
    let points_array = [top, bot_left, bot_right, top];
    canvas
        .draw_lines(&points_array[..])
        .expect("No driver error!");
}
```

We also have the helper function:

```Rust
/// A helper method to calculate the player's triangle.
fn calculate_point(x: f32, y: f32, bear: f32, deg: f32) -> FPoint {
    let (left_x, left_y) = (
        (x + (deg * 2.0 * PI / 360.0 + bear).cos() * SHIP_SIZE),
        (y + (deg * 2.0 * PI / 360.0 + bear).sin() * SHIP_SIZE),
    );
    FPoint::new(left_x, left_y)
}
```

What is this code doing? Well, you can think of it as taking the player's center (x, y) position, drawing a circle around it of size `SHIP_SIZE`, connecting three points on the circle at 0, 160, and 200 degrees, and then rotating this triangle according to the player's bearing. This allows us to draw the player in any position. If you are wondering, "but what's a bearing?" that's just the direction the player is facing in degrees. 0 is up towards the top of the screen and 180 is down towards the bottom.


## Drawing an Asteroid

** In Progress **
