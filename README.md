# Catanalyzer - Catan Settlement Optimizer

A React-based web application that helps Catan players find the optimal settlement locations on any board configuration. The app analyzes every possible settlement spot and ranks them based on expected resource production, resource value, and diversity.

## Features

- **Interactive Hex Grid**: Click to set resource types and number tokens
- **Realistic Board Generation**: Randomize button creates authentic Catan layouts
- **Smart Analysis**: Algorithm considers probability, resource value, and diversity
- **Visual Feedback**: Best settlement automatically highlighted after analysis
- **Detailed Scoring**: Comprehensive explanation of the scoring algorithm
- **Responsive Design**: Works on desktop and mobile devices

## How It Works

The Catanalyzer uses a sophisticated scoring algorithm that evaluates each possible settlement location based on:

1. **Expected Resource Production**: Combines dice probability with resource frequency
2. **Resource Value Weighting**: Different resources weighted by strategic importance
3. **Diversity Bonus**: Rewards settlements with varied resource types
4. **Final Score**: Higher scores indicate better long-term strategic positions

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. Clone or download the project files
2. Navigate to the project directory:
   ```bash
   cd "...\catanalyzer-main"
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:5173`

### Building for Production

To create a production build:

```bash
npm run build
```

The built files will be in the `dist` folder, ready for deployment.

## Usage

1. **Set up the board**: Use the resource selector at the bottom to paint resources on hexes
2. **Add number tokens**: Click on the numbers in hexes to set dice values (2-12, excluding 7)
3. **Randomize**: Use the "Randomize" button to generate a realistic Catan board
4. **Analyze**: Click "Analyze Board" to find optimal settlement locations
5. **View results**: The best spot is automatically selected and highlighted in blue

## Technical Details

- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS with custom CSS
- **Hex Grid**: react-hexgrid library
- **Build Tool**: Vite for fast development and optimized builds

## Contributing

Feel free to submit issues, feature requests, or pull requests to improve the Catanalyzer!

## License

This project is open source and available under the MIT License. 
