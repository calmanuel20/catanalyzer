# catanalyzer
React app that ranks optimal Catan settlements using probability and resource analysis
# Catan Settlement Optimizer

An interactive web tool to help **Settlers of Catan** players find the most strategic settlement spots using probability, resource value, scarcity, diversity, and synergy analysis.  
Built with **React**, **Vite**, and `react-hexgrid`.

## Features

- **Custom Board Setup** – Click hexes to assign resources and number tokens.
- **Real Dice Probabilities** – Scores use actual roll frequencies for each number (6 and 8 ≈ 13.9%).
- **Resource Value Weighting** – Wheat and Ore rank highest, followed by Wood, Sheep, and Brick.
- **Scarcity Adjustment** – Rare resources on the board are given higher weight.
- **Diversity Bonus** – Rewards spots with multiple resource types.
- **Strategic Synergy Bonus** – Small bonus for powerful combinations like Ore–Wheat–Sheep or Wood–Brick–Wheat.
- **Duplicate Number Bonus** – Recognizes the upside of doubling up on high-frequency numbers.
- **Top 10 Ranked Spots** – Easily view the best settlement locations.

---
