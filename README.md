# Trigonometric Dance Animation

A mesmerizing web application that creates a 2D human dancing animation using trigonometric functions. The dance patterns dynamically change based on different values of sine, cosine, tangent, and their reciprocal functions.

## Features

- Real-time 2D human figure animation
- Dynamic dance patterns based on trigonometric functions
- Modern and clean user interface
- Interactive controls for animation parameters
- Smooth animations using HTML Canvas

## Technologies Used

- Python (Flask)
- HTML5 Canvas
- JavaScript
- CSS3

## Setup Instructions

1. Clone this repository
2. Create a virtual environment:
   ```bash
   python -m venv venv
   ```
3. Activate the virtual environment:
   - Windows: `venv\Scripts\activate`
   - Unix/MacOS: `source venv/bin/activate`
4. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
5. Run the application:
   ```bash
   python app.py
   ```
6. Open your browser and navigate to `http://localhost:5000`

## How It Works

The application uses trigonometric functions to calculate the positions of different body parts of a 2D human figure. The animation is created by continuously updating these positions based on time and the selected trigonometric functions.

## License

MIT License 