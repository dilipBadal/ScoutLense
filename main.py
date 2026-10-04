import pandas as pd
import matplotlib.pyplot as plt

dataset = pd.read_csv('./data/football_player_stats/players_data-2025_2026.csv')


# print(dataset.columns.tolist())

# print(dataset.shape)

# print(dataset.info())

missing_values = dataset.isnull().sum().sort_values(ascending=False)
print(missing_values.head())

# print(dataset.duplicated().sum())

# dataset['Age'].hist()

# plt.show()