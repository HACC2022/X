import pandas as pd
import matplotlib.pyplot as plt
import numpy as np

# chart_params = []
#
# def make_chart(chart_type, chart_params):
#     if (chart_type == "bar_chart"):
#         bar_chart(title, x_labels, y_values)
#
#     elif(chart_type == "stacked_bar_chart"):
#         if (len(group_labels) >= 2):
#             stacked_bar_chart(title, x_labels, group_labels, y_values, y_label)
#         else:
#             return False



def bar_chart(title, x_label, y_value, y_label):
    fig, ax = plt.subplots()

    ax.bar(x_label, y_value)

    ax.set_ylabel(y_label)
    ax.set_title(title)

    plt.show()

#test
# x_labels = ['apple', 'blueberry', 'cherry', 'orange']
# y_values = [40, 100, 30, 55]
# y_label = 'fruit supply'
# title = 'avc'
#
# bar_chart(title, x_labels, y_values, y_label)


def stacked_bar_chart(title, x_label, group_labels, y_values, y_label):

    width = len(x_label)*0.08       # the width of the bars: can also be len(x) sequence

    fig, ax = plt.subplots()

    ax.bar(x_label, y_values[0], width, label=group_labels[0])
    ax.bar(x_label, y_values[1], width, bottom=y_values[0],
           label=group_labels[1])

    for i in range(2, len(group_labels)):
        ax.bar(x_label, y_values[i], width, bottom=y_values[i-1],
               label=group_labels[i])

    ax.set_ylabel(y_label)
    ax.set_title(title)
    ax.legend()

    plt.show()

#test
# title = 'This is a stacked chart'
# x_labels = ['G10', 'G20', 'G30', 'G40', 'G50']
# y_values = [[20, 35, 30, 35, 276], [25, 32, 34, 20, 50], [25, 32, 34, 20, 56]]
# group_labels = ['You', 'Me', 'He']
# y_label = 'abc'
#
# stacked_bar_chart(title, x_labels, group_labels, y_values, y_label)


def group_bar_chart(title, df):
    # plot grouped bar chart
    df.plot(x='Team',
            kind='bar',
            stacked=False,
            title=title)

    plt.show()

# test
# create data
# title = 'Grouped Bar Graph with dataframe'
# df = pd.DataFrame([['A', 100, 205, 160, 300], ['B', 20, 25, 15, 25], ['C', 12, 15, 19, 6],
#                    ['D', 10, 29, 13, 19]],
#                   columns=['Team', 'Round 1', 'Round 2', 'Round 3', 'Round 4'])
#
# group_bar_chart(title, df)





def line_chart(title, x_label, y_label, x_data, y_data):
    for i in range(len(x_data)):
        plt.plot(x_data[i], y_data[i])
    plt.title(title)
    plt.xlabel(x_label)
    plt.ylabel(y_label)
    plt.show()


def scatter_chart(title, x_label, y_label, x_data, y_data):
    for i in range(len(x_data)):
        plt.scatter(x_data[i], y_data[i])
    plt.title(title)
    plt.xlabel(x_label)
    plt.ylabel(y_label)
    plt.show()


def area_chart(title, x_label, y_label, x_data, y_data):
    for i in range(len(x_data)):
        plt.fill_between(x_data[i], y_data[i])
    plt.title(title)
    plt.xlabel(x_label)
    plt.ylabel(y_label)
    plt.show()


def pie_chart(title, label, data):
    plt.title(title)
    plt.pie(data, labels=label)
    plt.show()


def donut_chart(title, label, data):
    plt.pie(data, labels=label, autopct='%1.1f%%')
    center_circle = plt.Circle((0, 0), 0.70, fc='white')
    fig = plt.gcf()
    fig.gca().add_artist(center_circle)
    plt.title(title)
    plt.show()

#test
title = 'tst title'
x_label = ['G10', 'G20', 'G30', 'G40', 'G50']
y_label = ['as']
x_data = [[20, 35, 30, 35, 276], [50, 56, 234, 456, 456], [2, 3, 2, 5, 6]]
y_data = [[20, 35, 30, 35, 276], [25, 32, 34, 20, 50], [25, 32, 34, 20, 56]]

labels = 'Frogs', 'Hogs', 'Dogs', 'Logs'
sizes = [15, 30, 45, 10]

#need redo to add line color label
# line_chart(title, x_label, y_label, x_data, y_data)
# scatter_chart(title, x_label, y_label, x_data, y_data)
# area_chart(title, x_label, y_label, x_data, y_data)

# pie_chart(title, labels, sizes)
# donut_chart(title, labels, sizes)