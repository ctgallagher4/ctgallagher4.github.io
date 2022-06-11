---
layout: post
title:  "Predicting Wildfires in Australia Using Historical Weather Data"
date:   2022-06-11 14:54:20 -0400
categories: Blog Post
---

## About

In this project, I use historical weather data from an IBM spot challenge (here). To predict the occurence of a wildfire in a given state on a given day in Australia. A variety of methods were used for this project. These include a data table pivot, VIF
analysis, non-randomized train/test split, multinomial logistic regression (MAXENT), extreme
gradient boost classification (XGBoost), multi-layer perceptron classification (MLP), k-nearest
neighbors classification (KNN), random forest classification (RF), logistic generalized additive
models classification (LogisticGAM), tree based classification (TR), support vector classification
(SVC), naive Bayes classification (NB), extreme gradient boosting-random forest ensemble
methods (XGBRF), experimentation with bagging and importance, and experimentation with
logisticGAM over various time intervals. Data was split into 70%, 20%, and 10% training,
validation, and test sets respectively. Because the data are sequential in time, it was necessary to
avoid predicting the past with the future. So data were split sequentially so that the ordinal
position was preserved across training, validation, and test sets. Further, the 70% training set was
split into a 50% and 20% (total) subtraining training and subtraining testing sets. In this way, a
“competition” was performed between models. The 50/20 split was used to test hyperparameters.
The resultant model was then trained on the 70% training set, tested on the validation set, and
compared to all other models. The most successful of these was trained on the training and
validation sets concatenated together and tested on the test set. You can find the notebook on my [github](https://github.com/ctgallagher4/). This project was done for a class called Data Analysis in UChicago's MPCS. With more time, I would have cleaned up my code, tested more hyper-parameters, and explored more methods for parameter selection. This was the first machine learning project I ever attempted. At the very least, I learned how to use scikit-learn!

## Results

After much pivoting, cleaning, transforming, renaming, and model selecting, I found that the most perfomant model was the random forest classifier (RF) with default hyperparameters. This led to a no-fire prediction precision of 0.76 and a fire prediction precision of 0.91. Further, a no-fire recall of 0.83 and a fire recall of 0.87 were recorded with an overall accuracy of 0.8521 and an AUC-ROC of 0.9277. 

## Paper 

<object data="{{ site.url }}{{ site.baseurl }}/FinalPaper.pdf" width="1000" height="1000" type='application/pdf'></object>