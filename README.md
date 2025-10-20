# Teenpatti Playable Ad - Phaser.js Implementation

A responsive Teenpatti playable ad built with Phaser.js that replicates the mobile game interface. This is a one-time playable ad that works without a server.

## Features

- **One-Time Play**: Playable ad that works for one chance only
- **No Server Required**: Works standalone without any server setup
- **Responsive Design**: Works on all mobile devices with automatic scaling
- **Authentic UI**: Replicates the original game's visual design using colored shapes
- **Card Dealing Animation**: Smooth card dealing with animations
- **Interactive Elements**: Clickable buttons and UI elements
- **Touch Support**: Full touch/mobile interaction support
- **Download Prompt**: Ends with download call-to-action

## Game Elements

### Visual Components
- Background: Purple colored background
- Game Table: Red oval table with border
- Dealer: Pink colored rectangle representing dealer
- Player Icons: Blue circles representing players
- Card Backs: Red rectangles with 'Q' symbol
- UI Elements: Colored shapes and text

### Game Features
- 3 Players (2 AI + 1 User)
- Dealer with TIP+ button
- Card dealing system (3 cards per player)
- Pot display and betting information
- Interactive UI buttons
- Responsive scaling for different screen sizes

## How to Run

1. **Direct File**: Simply open `index.html` in any modern web browser
2. **No Server Needed**: Works as a standalone playable ad
3. **Mobile Testing**: Use browser dev tools to test different mobile screen sizes
4. **Deploy**: Upload files to any web hosting service

## Responsive Features

- **Automatic Scaling**: Game scales based on screen dimensions
- **Orientation Support**: Works in both portrait and landscape
- **Touch Optimization**: All interactions work with touch
- **Minimum/Maximum Sizes**: Prevents game from becoming too small or large

## Game Controls

- **SEE Button**: Click to reveal your cards (one-time only)
- **TIP+ Button**: Tip the dealer
- **Back Button**: Navigate back
- **Menu Button**: Access game menu
- **Shop Button**: Open shop
- **Add Player Buttons**: Add new players to the table
- **Download Button**: Appears after one play to download full game

## Technical Details

- **Framework**: Phaser.js 3.70.0
- **Responsive**: Uses Phaser's RESIZE scale mode
- **Assets**: Uses colored shapes instead of image files for standalone operation
- **Animations**: Smooth card dealing and UI animations
- **Performance**: Optimized for mobile devices

## File Structure

```
teenpatti_demo/
├── index.html          # Main HTML file
├── game.js            # Phaser.js game logic
├── README.md          # Documentation
└── (original assets - not used in playable ad)
```

## Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance Notes

- Game automatically adjusts quality based on device capabilities
- Assets are optimized for mobile loading
- Smooth 60fps animations on capable devices
- Memory efficient card management
