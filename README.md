# VaporJump 🌆✨

A vaporwave-themed endless jumping game inspired by Doodle Jump, featuring 80's neon aesthetics and retro vibes.

## 🎮 Gameplay

Move horizontally from left to right across platforms while avoiding falling off the bottom. The farther you travel, the higher your score. But be careful - fall off the screen and it's game over!

## ✨ Features

- **80's Vaporwave Aesthetic** - Neon pink, cyan, and yellow color palette with glowing effects
- **Retro Grid Background** - Classic vaporwave grid pattern
- **Synthwave Soundtrack** - Procedurally generated 80s style synth music using Web Audio API
- **Retro Sound Effects** - Jump sounds and game over effects with authentic synth tones
- **High Score Tracking** - Your best score is saved locally
- **Smooth Physics** - Realistic jumping and gravity mechanics
- **Horizontal Scrolling** - Move automatically from left to right through the neon mall
- **Responsive Design** - Plays on desktop and mobile devices
- **Audio Controls** - Mute/unmute button for music and sound effects

## 🕹️ Controls

- **↑ ↓ Arrow Keys** - Move up and down
- **Automatic Movement** - Player moves right automatically
- **Automatic Jumping** - Player jumps automatically when landing on platforms

## 🚀 How to Play

1. Open `index.html` in any modern web browser
2. Click **START GAME** from the main menu
3. Use arrow keys to guide your character up and down
4. Land on platforms to bounce upward as you move right
5. Avoid falling off the bottom of the screen
6. Beat your high score!

## 📁 Files

- `index.html` - Main HTML structure
- `styles.css` - Vaporwave styling and animations
- `game.js` - Game logic and canvas rendering
- `audio.js` - 80s synthwave audio system using Web Audio API

## 🎨 Design Elements

- **Neon Glowing Text** - Animated flickering effects
- **Gradient Backgrounds** - Deep purple to dark blue transitions
- **Multiple Platform Colors** - Randomly colored platforms (pink, cyan, yellow, hot pink)
- **Triangle Player Character** - Glowing geometric shape
- **Scan Line Effects** - Retro CRT monitor feel
- **Orbitron Font** - Futuristic 80's computer typography
- **Procedural Synth Music** - Authentic 80s synthwave soundtrack with chord progressions
- **Interactive Audio** - Dynamic sound effects for jumps and game events

## 🛠️ Technical Details

Built with vanilla JavaScript and HTML5 Canvas. No external libraries required!

- Canvas-based rendering
- RequestAnimationFrame for smooth 60fps gameplay
- LocalStorage for high score persistence
- Responsive viewport sizing
- Web Audio API for procedural audio synthesis
- Real-time sound generation (no audio files needed)

## 🎵 Audio Features

The game features a fully procedurally generated 80s synthwave soundtrack:

- **Chord Progression**: I-vi-IV-V in C major (classic 80s pop progression)
- **Synth Pads**: Warm sawtooth wave pads with slow attack/release
- **Bass Line**: Punchy triangle wave bass on beats 1 and 3
- **Arpeggios**: Square wave arpeggios for that classic synth texture
- **Sound Effects**: 
  - Jump: Upward pitch sweep
  - Game Over: Downward pitch sweep
- **Audio Controls**: Mute/unmute button in top-right corner
- **No Audio Files**: Everything is generated in real-time using the Web Audio API

## 🎯 Game Mechanics

- **Gravity**: 0.5 units/frame (downward)
- **Jump Force**: -15 units (upward)
- **Platform Gap**: 80 pixels (horizontal)
- **Player Speed**: 5 units/frame (rightward, constant)
- **Score**: Based on distance traveled

## 📱 Browser Compatibility

Works on all modern browsers that support:
- HTML5 Canvas
- ES6 JavaScript
- CSS3 animations
- Web Audio API

## 🎵 Future Enhancements

- Power-ups (springs, jetpacks)
- Moving platforms
- Enemy obstacles
- Multiple difficulty levels
- Leaderboard integration
- Additional music tracks

## 📄 License

Created as a web-based tribute to classic jumping games with a vaporwave twist.

---

**Enjoy the A E S T H E T I C journey! 🌴🌊🌸**
