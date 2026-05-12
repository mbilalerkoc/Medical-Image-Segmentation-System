# --- demo/simulation.py ---
import os
import numpy as np
import matplotlib.pyplot as plt
import tkinter as tk
from tkinter import filedialog
from tensorflow.keras.utils import load_img, img_to_array
from ai_engine.utils import tumor_analizi_yap

# visualizer.py'den kestiğin şu fonksiyonu buraya yapıştır:
# 1. disaridan_mr_tahmin_et(...)