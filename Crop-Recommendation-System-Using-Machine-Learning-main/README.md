# Crop Recommendation System Using Machine Learning
A machine learning-based system to recommend optimal crops based on soil, climate, and environmental conditions, aimed at helping farmers and agricultural professionals make better decisions for maximizing yields and profitability.

## Table of Contents
- [Overview](#overview)
- [Dataset](#dataset)
- [Key Features](#key-features)
- [Technologies Used](#technologies-used)
- [Project Structure](#project-structure)
- [Experiment Results](#experiment-results)
- [Installation](#installation)
- [Contributing](#contributing)
- [Dependencies](#Dependencies)
- [License](#license)

## Overview
This repository offers a machine learning pipeline to predict the most suitable crop based on specific environmental and soil properties. By leveraging advanced predictive models and historical data, the system delivers personalized crop recommendations tailored to the conditions of a given region or farm. Key factors considered include soil nutrient content (N, P, K), temperature, humidity, rainfall, and pH level.

## Dataset
The system uses a dataset augmented with rainfall, climate, and fertilizer data relevant to India. The key attributes are:
- **N:** Nitrogen in soil
- **P:** Phosphorous in soil
- **K:** Potassium in soil
- **Temperature:** (°C)
- **Humidity:** (%)
- **pH:** Soil pH
- **Rainfall:** (mm)

## Key Features
- **Input Data Collection:** Accepts user input for soil and environmental parameters.
- **Data Preprocessing:** Handles missing values and scales features with normalization.
- **Multiple ML Models:** Includes Decision Trees, Random Forests, SVM, and Gradient Boosting for accurate predictions.
- **Model Training and Evaluation:** Models are evaluated via relevant metrics to ensure reliability.
- **Crop Recommendation:** Suggests suitable crops for provided soil/climate input.

## Technologies Used

- **Python:** Backend and ML development
- **Scikit-learn:** Model building, training, evaluation
- **Pandas:** Data manipulation and analysis
- **NumPy:** Numerical computations

## Project Structure
```
Crop-Recommendation-System-Using-Machine-Learning/
├── Datasets/
│ ├── crop_data1.csv
│ ├── crop_data2.cs
├── Notebook/
│ ├── Crop recommendation final.ipynb
├── requirements.txt
├── Contributing.md
├── README.md
├── License
└── [output_and_model_files]
```
## Experiment Results
- **Outlier Analysis:** All columns except Nitrogen (N) have outliers
- **Train/Test Split:** 80% train, 20% validation
- **Top Performing Model:** Gaussian Naive Bayes (GaussianNB) with:
   - Training Accuracy: **93.26%**
   - Validation Accuracy: **92.53%**

## Installation

1. **Clone this repository:**
    ```
    git clone https://github.com/KRUTHIKTR/Crop-Recommendation-System-Using-Machine-Learning.git
    cd Crop-Recommendation-System-Using-Machine-Learning
    ```

2. **Create a virtual environment (optional):**
    ```
    python -m venv venv
    source venv/bin/activate        # On Windows: venv\Scripts\activate
    ```

3. **Install dependencies:**
    ```
    pip install -r requirements.txt
    ```
## Contributing

Contributions are welcome. Please read the [`CONTRIBUTING.md`](https://github.com/KRUTHIKTR/Crop-Recommendation-System-Using-Machine-Learning/blob/main/Contributing.md)) file for guidelines.

## Dependencies
The project requires the Python packages (mentioned in `requirements.txt`)

## License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

## Contact
For any queries, feel free to reach out:

<a href="mailto:kruthiktrgowda24@gmail.com" target="_blank">
  <img src="https://img.shields.io/static/v1?message=Gmail&logo=gmail&label=&color=D14836&logoColor=white&labelColor=&style=for-the-badge" height="26" alt="gmail logo"  />
</a>

<a href="https://github.com/KRUTHIKTR" target="_blank">
<img src=https://img.shields.io/badge/github-%2324292e.svg?&style=for-the-badge&logo=github&logoColor=white alt=github style="margin-bottom: 5px;" />
</a>

<a href="https://linkedin.com/in/kruthiktr" target="_blank">
<img src=https://img.shields.io/badge/linkedin-%231E77B5.svg?&style=for-the-badge&logo=linkedin&logoColor=white alt=linkedin style="margin-bottom: 5px;" />
</a>

<a href="https://linktr.ee/kruthik_tr" target="_blank">
  <img src="https://img.shields.io/static/v1?message=Linktree&logo=linktree&label=&color=1de9b6&logoColor=white&labelColor=&style=for-the-badge" height="26" alt="linktree logo"  />
</a>


###### Thank you for checking out the Crop Recommendation System Using Machine Learning project! Feel free to explore and contribute.
