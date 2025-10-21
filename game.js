class TeenpattiGame extends Phaser.Scene {
  constructor() {
    super({ key: "TeenpattiGame" });

    // Game state
    this.gameState = {
      pot: 234000,
      bootValue: 78000,
      maxBet: 2496000,
      potLimit: 19968000,
      players: [
        { name: "Payal", bet: 78000, isBlind: true, cards: [] },
        { name: "kushal", bet: 78000, isBlind: true, cards: [] },
        { name: "You", amount: "1.3Cr", cards: [] },
      ],
      dealer: { name: "Dealer" },
      cardsDealt: false,
      gamePlayed: false,
      gameEnded: false,
    };

    this.uiElements = {};
    this.cards = [];
    this.playerPositions = [];

  }

  preload() {
    this.load.on("progress", (progress) => {
      document.getElementById("loading-progress").style.width =
        progress * 100 + "%";
    });

    // Create colored rectangles as placeholders for assets (for playable ad)
    this.load.image("background", "gamelayerbase_portrait.webp");
    this.load.image("table", "Teenpatti_Table_Portrait_public.png");
    this.load.image("dealer", "dealer.png");
    this.load.image("cardBack", "card_back.png");
    this.load.image("backIcon", "Back_icon.png");
    this.load.image("tableMenuIcon", "TableMenu_icon.png");
    this.load.image("queen", "queen.png");
    this.load.image("four", "four.png");
    this.load.image("two", "two.png");
    this.load.image("king", "king.png");
    this.load.image("ace", "ace.png");
    this.load.image("see", "see.png");
    this.load.image("Chaal_button", "Chaal_Button.png")
    this.load.image("show_button", "Show_Button.png")
    this.load.image("sparkle", "sparkle.png")
    this.load.image("playerIcon1", "icon2.png");
    this.load.image("playerIcon2", "icon1.png");
    this.load.image("playerIcon3", "icon3.png");
    this.load.image('Blind_Button', 'Blind_Button.png');
    this.load.audio('dealSound', 'teenpattideal.mp3');
    this.load.audio('card_flip', 'teenpatticardflip_android.mp3');
    this.load.audio('winner_sound', 'Winner_Sound.mp3');
    this.load.audio('button_click', 'teenpatticardflip_ios.mp3');

    // Hide loading screen when complete
    this.load.on("complete", () => {
      setTimeout(() => {
        document.getElementById("loading").style.display = "none";
      }, 500);
    });
  }

  create() {
    const { width, height } = this.scale;

    // Background
    this.bg = this.add
      .image(width / 2, height / 2, "background")
      .setOrigin(0.5)
      .setTint(0xffffff)
      .setAlpha(1);

    // Table
    this.table = this.add
      .image(width / 2, height * 0.55, "table")
      .setOrigin(0.5)
      .setTint(0xeeeeee)
      .setAlpha(1);
      this.scale.on("resize", (gameSize) => {
        const { width, height } = gameSize;
        const isLandscape = width > height;
      
        // Dynamically change table texture
        const newTexture = isLandscape
          ? "Teenpatti_Table_landscape_public.png"
          : "Teenpatti_Table_Portrait_public.png";
      
        // Load and update if needed
        if (!this.textures.exists(newTexture)) {
          this.load.image("tableTemp", newTexture);
          this.load.once("complete", () => {
            this.table.setTexture("tableTemp");
            this.resize(width, height);
          });
          this.load.start();
        } else {
          this.table.setTexture(newTexture);
          this.resize(width, height);
        }
      });
      
    // Show "Tap to Play" message for 2 seconds
    const tapToPlayText = this.add.text(width / 2, height / 2, "Tap to Play", {
      font: "40px Arial Black",
      fill: "#ffffff",
      fontStyle: "bold",
      stroke: "#000000",
      strokeThickness: 4,
    }).setOrigin(0.5).setDepth(200);

    this.time.delayedCall(2000, () => {
      // Fade out the text smoothly
      this.tweens.add({
        targets: tapToPlayText,
        alpha: { from: 1, to: 0 },
        duration: 500,
        onComplete: () => tapToPlayText.destroy(),
      });
    });

    this.resize(width, height);
    this.scale.on("resize", (gameSize) => {
      this.resize(gameSize.width, gameSize.height);
    });

    this.createDealer(width, height);
    this.createPlayers(width, height);

    this.showBottomStripe();

    // Other UI elements
    this.createUI(width, height);
    this.createCards(width, height);

    // Start dealing cards after a short delay
    this.time.delayedCall(2000, () => {
      this.dealCards();
    });
  }

  showBottomStripe() {
    const { width, height } = this.scale;
    const stripeHeight = 80;
    const stripe = this.add.rectangle(
      width / 2,
      height - stripeHeight / 2,
      width,
      stripeHeight,
      0x000000,
      0.7 // opacity
    ).setOrigin(0.5)
      .setDepth(100);

    const textStyle = {
      fontSize: "12px",
      color: "#FFFFFF",
      fontStyle: "bold",
      stroke: "#000000",
      strokeThickness: 2,
      align: "center"
    };

    const bootText = this.add.text(width / 2, height - stripeHeight + 10,
      `Boot Value: ${this.gameState.players[0].bet.toLocaleString()}`, textStyle)
      .setOrigin(0.5, 0)
      .setDepth(101);

    const maxBetText = this.add.text(width / 2 - 30, height - stripeHeight + 35, `Max Bet: 2,496,000`, textStyle)
      .setOrigin(1, 0.5)
      .setDepth(101);

    const potLimitText = this.add.text(width / 2 + 30, height - stripeHeight + 35, `Pot Limit: 19,968,000`, textStyle)
      .setOrigin(0, 0.5)
      .setDepth(101);

    this.uiElements.bottomStripe = { stripe, bootText, maxBetText, potLimitText };
    this.time.delayedCall(12000, () => {
      stripe.destroy();
      bootText.destroy();
      maxBetText.destroy();
      potLimitText.destroy();
    });
  }

  resize(width, height) {
    const bgTex = this.textures.get("background").getSourceImage();
    const scaleX = width / bgTex.width;
    const scaleY = height / bgTex.height;
    const finalScale = Math.max(scaleX, scaleY);

    this.bg.setPosition(width / 2, height / 2).setScale(finalScale);

    const tableTex = this.textures.get("table").getSourceImage();
    const scaleXTable = (width * 0.9) / tableTex.width;
    const scaleYTable = (height * 1.5) / tableTex.height;
    const finalTableScale = Math.min(scaleXTable, scaleYTable);

    this.table.setPosition(width / 2, height * 0.55).setScale(finalTableScale);
  }


  createDealer(width, height) {
    const tableY = height * 0.55;
    const tableTex = this.textures.get("table").getSourceImage();
    const tableScale = Math.min(
      (width * 0.9) / tableTex.width,
      (height * 0.6) / tableTex.height
    );
    const tableHeightScaled = tableTex.height * tableScale;

    const baseWidth = 375;
    const dealerScale = Math.min(width / baseWidth, height / 667) * 0.4;

    // Dealer Y positioned slightly above the table
    const dealerY = tableY - tableHeightScaled / 2 - 30;

    this.dealerImage = this.add
      .image(width / 2 - 18, dealerY, "dealer")
      .setScale(dealerScale)
      .setOrigin(0.5)
      .setTint(0xffffff);
  }

  createPlayers(width, height) {
    const baseWidth = 375;
    const baseHeight = 667;
    const playerScale = Math.min(width / baseWidth, height / baseHeight) * 0.35;

    const tableY = height * 0.55;

    this.playerPositions = [
      { x: width * 0.15, y: tableY - height * 0.15 }, // left
      { x: width * 0.85, y: tableY - height * 0.15 }, // right
      { x: width * 0.5, y: tableY + height * 0.17 },  // bottom (You)
    ];

    // Map player index to their icon key
    const playerIcons = ["playerIcon1", "playerIcon2", "playerIcon3"];

    this.uiElements.players = [];

    this.gameState.players.forEach((player, index) => {
      const pos = this.playerPositions[index];

      const icon = this.add
        .image(pos.x, pos.y - 30, playerIcons[index])
        .setScale(playerScale)
        .setOrigin(0.5);

      const nameFontSize = Math.max(18, Math.min(24, width / 20));
      const nameText = this.add
        .text(pos.x, pos.y + 20, player.name, {
          fontSize: `${nameFontSize}px`,
          color: "#FFFFFF",
          fontStyle: "bold",
          stroke: "#000000",
          strokeThickness: 3,
          align: "center",
        })
        .setOrigin(0.5);

      const statusFontSize = Math.max(14, Math.min(18, width / 22));

      let statusText;
      if (index === 2) {
        statusText = this.add
          .text(pos.x, pos.y - icon.displayHeight / 2 - 10, player.amount, {
            fontSize: `${statusFontSize * 1.3}px`,
            color: "#FFD700",
            fontStyle: "bold",
            stroke: "#000000",
            strokeThickness: 5,
          })
          .setOrigin(0.5);
      } else {
        statusText = this.add
          .text(pos.x, pos.y - 100, "Blind", {
            fontSize: `${statusFontSize}px`,
            color: "#FFD700",
            fontStyle: "bold",
            stroke: "#000000",
            strokeThickness: 5,
          })
          .setOrigin(0.5)
          .setVisible(false);
      }

      const betText =
        index < 2
          ? this.add
            .text(pos.x, pos.y - 80, `B ${player.bet.toLocaleString()}`, {
              fontSize: `${statusFontSize}px`,
              color: "#00FF00",
              fontStyle: "bold",
              stroke: "#000000",
              strokeThickness: 2,
            })
            .setOrigin(0.5)
            .setVisible(false)
          : null;

      this.uiElements.players[index] = { icon, nameText, statusText, betText };
    });

    this.time.delayedCall(1000, () => {
      this.animatePotCollection(width, height);
    });
  }

  createUI(width, height) {
    const baseWidth = 375;
    const baseHeight = 667;
    const uiScale = Math.min(width / baseWidth, height / baseHeight) * 0.6;
    const topBarHeight = Math.max(50, height * 0.1);
  
    // Load sound reference
    const clickSound = this.sound.add('button_click');
  
    this.add
      .image(width * 0.1, topBarHeight / 2, "backIcon")
      .setScale(uiScale)
      .setInteractive()
      .on("pointerdown", () => {
        clickSound.play();
        this.goBack();
      });
  
    this.add
      .image(width * 0.9, topBarHeight / 2, "tableMenuIcon")
      .setScale(uiScale)
      .setInteractive()
      .on("pointerdown", () => {
        clickSound.play();
        this.showMenu();
      });
  
    // POT text
    const potFontSize = Math.max(28, Math.min(40, width / 15));
    const potY = height * 0.4;
  
    const potText = this.add.text(width / 2, potY, "", {
      fontSize: `${potFontSize}px`,
      fontFamily: "Arial Black, sans-serif",
      fontStyle: "bold",
      color: "#FFD700",
      stroke: "#000000",
      strokeThickness: 4,
      align: "center",
    }).setOrigin(0.5);
  
    potText.setVisible(false);
    this.uiElements.potText = potText;
  
    // SEE Button (hidden initially)
    const seeButtonImage = this.add
      .image(width / 2, height * 0.82, "see")
      .setOrigin(0.5)
      .setScale(0.5)
      .setInteractive()
      .setVisible(false)
      .setDepth(50)
      .on("pointerdown", () => {
        clickSound.play(); // ✅ play sound
        this.gameState.seeClicked = true;
        this.revealYourCards();
  
        if (this.uiElements.blindButton?.visible) {
          this.uiElements.blindButton.setVisible(false);
          if (this.uiElements.chaalButton) {
            this.uiElements.chaalButton.setVisible(true).setDepth(50);
          }
        }
      });
  
    const seeButtonText = this.add.text(width / 2, height * 0.82, "SEE", {
      fontSize: "20px",
      color: "#FFFFFF",
      fontStyle: "bold",
    }).setOrigin(0.5).setDepth(51).setVisible(false);
  
    // Chaal button
    const chaalButton = this.add.image(width * 0.3, height * 0.92, "Chaal_button")
      .setOrigin(0.5)
      .setScale(0.6)
      .setInteractive()
      .setVisible(false)
      .setDepth(50)
      .on("pointerdown", () => {
        clickSound.play(); // ✅ play sound
        this.gameState.chaalClicked = true;
        const potDiff = 156000;
          this.gameState.chaalClicked = true;
          this.gameState.blindClicked = false;
        this.handleBottomBet(potDiff);
      });
  
    // Blind button
    const blindButton = this.add.image(width * 0.3, height * 0.92, "Blind_Button")
      .setOrigin(0.5)
      .setScale(0.6)
      .setInteractive()
      .setVisible(false)
      .setDepth(50)
      .on("pointerdown", () => {
        clickSound.play(); // play sound
        const potDiff = 78000;
        this.handleBottomBet(potDiff);
        this.gameState.blindClicked = true;
        this.gameState.chaalClicked = false;
      });
  
    // Show button
    const showButton = this.add.image(width * 0.7, height * 0.92, "show_button")
      .setOrigin(0.5)
      .setScale(0.6)
      .setInteractive()
      .setVisible(false)
      .setDepth(50)
      .on("pointerdown", () => {
        clickSound.play(); // ✅ play sound
        this.showFinalCards();
      });
  
    // Register UI elements
    this.uiElements.chaalButton = chaalButton;
    this.uiElements.blindButton = blindButton;
    this.uiElements.showButton = showButton;
    this.uiElements.seeButtonImage = seeButtonImage;
    this.uiElements.seeButtonText = seeButtonText;
  }  

  handleBottomBet(potDiff) {
    const { width, height } = this.scale;
    const bottomPlayerIndex = 2; // bottom player
    const middlePlayerIndex = 1; // second player who didn't pack
    const bottomPlayer = this.uiElements.players[bottomPlayerIndex];

    // Stop bottom player timer
    if (bottomPlayer.timerEvent) bottomPlayer.timerEvent.remove(false);
    if (bottomPlayer.timerCircle) bottomPlayer.timerCircle.destroy();

    // Hide Chaal, Blind & Show buttons
    if (this.uiElements.chaalButton) this.uiElements.chaalButton.setVisible(false);
    if (this.uiElements.blindButton) this.uiElements.blindButton.setVisible(false);
    if (this.uiElements.showButton) this.uiElements.showButton.setVisible(false);
    if (this.uiElements.showButtonText) this.uiElements.showButtonText.setVisible(false);

    // SEE button stays visible
    if (this.uiElements.seeButtonImage) this.uiElements.seeButtonImage.setVisible(true);
    if (this.uiElements.seeButtonText) this.uiElements.seeButtonText.setVisible(true);

    const bottomPos = this.playerPositions[bottomPlayerIndex];
    const potPos = { x: width / 2, y: height * 0.4 };
    const oldPot = this.gameState.pot || 0;
    this.gameState.pot = oldPot + potDiff;

    // Moving container with coin
    const movingContainer = this.add.container(bottomPos.x, bottomPos.y - 100).setAlpha(0).setDepth(80);
    const coin = this.add.image(0, 0, "coin_img").setScale(0.02);
    const amountText = this.add.text(10, 0, `+${potDiff.toLocaleString()}`, {
      fontSize: "26px",
      color: "#FFD700",
      fontStyle: "bold",
      stroke: "#000000",
      strokeThickness: 4,
    }).setOrigin(0, 0.5);
    movingContainer.add([coin, amountText]);

    const balanceText = this.uiElements.balanceText;
    const oldBalance = balanceText ? parseInt(balanceText.text.replace(/,/g, "")) : 13000000;
    const newBalance = oldBalance - potDiff;

    this.tweens.add({
      targets: movingContainer,
      alpha: { from: 0, to: 1 },
      x: potPos.x + Phaser.Math.Between(-25, 25),
      y: potPos.y + Phaser.Math.Between(-15, 15),
      scale: { from: 1, to: 0.7 },
      duration: 1200,
      ease: "Sine.easeInOut",
      onUpdate: () => {
        if (balanceText) {
          const progress = movingContainer.alpha;
          const currentBalance = oldBalance + (newBalance - oldBalance) * progress;
          balanceText.setText(`${Math.floor(currentBalance).toLocaleString()}`);
        }
      },
      onComplete: () => {
        movingContainer.destroy();
        this.animatePotValue(oldPot, this.gameState.pot, 2000);

        // --- START SECOND ROUND for middle player (player 1) ---
        this.time.delayedCall(2000, () => {
          this.startSecondRoundMiddlePlayer();
        });
      }
    });
  }

  startSecondRoundMiddlePlayer() {
    const middlePlayerIndex = 1;
    const pos = this.playerPositions[middlePlayerIndex];
  
    // Mark as second round
    this.gameState.secondRound = true;
  
    // Middle player turn timer (6s)
    this.startPlayerTurn(middlePlayerIndex, false, 6);
  
    // Show “Show” text above player
    const showText = this.add.text(pos.x, pos.y - 50, "Show", {
      fontSize: "22px",
      color: "#FFD700",
      fontStyle: "bold",
      stroke: "#FF4500",
      strokeThickness: 5,
    }).setOrigin(0.5).setAlpha(0);
  
    this.tweens.add({
      targets: showText,
      alpha: { from: 0, to: 1 },
      scale: { from: 0, to: 1.3 },
      ease: "Back.Out",
      duration: 500,
      yoyo: true,
      onComplete: () => {
        this.time.delayedCall(1000, () => showText.destroy());
      }
    });
  
    // In second round after blind + chaal → skip chaal visuals and directly show cards
    this.time.delayedCall(1000, () => { 
      this.showChaalAndFlowingWin(pos, middlePlayerIndex, 312000, 858000, true);
    });
  
    // Show final cards after short delay
    this.time.delayedCall(2500, () => {
      this.showFinalCards();
    });
  }
  

  showPotValue(x, y, potAmount) {
    let potText = this.uiElements.potText;
    if (!potText) {
      // Create if not exists
      potText = this.add.text(x, y, `₹${potAmount.toLocaleString()}`, {
        fontSize: "32px",
        color: "#FFD700",
        fontStyle: "bold",
        stroke: "#000000",
        strokeThickness: 5,
      }).setOrigin(0.5);
      this.uiElements.potText = potText;
    } else {
      // Simply update to final value
      potText.setText(`₹${potAmount.toLocaleString()}`);
      potText.setVisible(true);
    }
  }

  showFinalCards() {
    const { width, height } = this.scale;
    const cardNames = [
      ["two", "four", "queen"],   // Left player (packed)
      ["two", "king", "queen"],   // Right player
      ["ace", "king", "queen"],   // Bottom player (You)
    ];
  
    const bottomPlayerPos = this.playerPositions[2];
    const potPos = { x: width / 2, y: height * 0.4 };
  
    // Hide betting buttons
    if (this.uiElements.showButton) this.uiElements.showButton.setVisible(false);
    if (this.uiElements.chaalButton) this.uiElements.chaalButton.setVisible(false);
    if (this.uiElements.blindButton) this.uiElements.blindButton.setVisible(false);
  
    const oldPot = this.gameState.pot || 0;
    let potDiff, newPotValue;
  
    // Skip bottom player animation if second round after blind or chaal
    const skipBottomPlayerMoney =
      this.gameState.secondRound === true &&
      (this.gameState.blindClicked === true || this.gameState.chaalClicked === true);
  
    if (!this.gameState.firstRoundShowDone) {
      // First round
      potDiff = this.gameState.chaalClicked ? 312000 : 156000;
      newPotValue = oldPot + potDiff;
      this.gameState.firstRoundShowDone = true;
    } else {
      // Second or subsequent round
      const targetPot = 858000;
      potDiff = targetPot - oldPot;
      newPotValue = oldPot + potDiff;
    }
  
    this.gameState.pot = newPotValue;
  
    // Animate bottom player money flow only if not skipping
    if (!skipBottomPlayerMoney) {
      const movingContainer = this.add.container(bottomPlayerPos.x, bottomPlayerPos.y - 100).setAlpha(0);
      const coin = this.add.image(0, 0, "coin_img").setScale(0.02);
      movingContainer.add(coin);
  
      const amountText = this.add.text(20, 0, `+${potDiff.toLocaleString()}`, {
        fontSize: "26px",
        color: "#FFD700",
        fontStyle: "bold",
        stroke: "#000000",
        strokeThickness: 4,
      }).setOrigin(0, 0.5);
      movingContainer.add(amountText);
  
      const balanceText = this.uiElements.balanceText;
      const oldBalance = balanceText ? parseInt(balanceText.text.replace(/,/g, "")) : 13000000;
      const newBalance = oldBalance - potDiff;
  
      this.tweens.add({
        targets: movingContainer,
        alpha: { from: 0, to: 1 },
        x: potPos.x + Phaser.Math.Between(-25, 25),
        y: potPos.y + Phaser.Math.Between(-15, 15),
        scale: { from: 1, to: 0.7 },
        duration: 1200,
        ease: "Sine.easeInOut",
        onUpdate: () => {
          if (balanceText) {
            const progress = movingContainer.alpha;
            const currentBalance = oldBalance + (newBalance - oldBalance) * progress;
            balanceText.setText(`${Math.floor(currentBalance).toLocaleString()}`);
          }
        },
        onComplete: () => {
          movingContainer.destroy();
          this.animatePotValue(oldPot, this.gameState.pot, 2000);
        }
      });
    } else {
      // Skip bottom animation, update pot silently
      this.animatePotValue(oldPot, this.gameState.pot, 1000);
  
      // Reset blind/chaal flags for next rounds
      this.gameState.blindClicked = false;
      this.gameState.chaalClicked = false;
    }
  
    // Reveal cards after delay (1s if skipped, 3s otherwise)
    const delayBeforeCards = skipBottomPlayerMoney ? 1000 : 3000;
  
    this.time.delayedCall(delayBeforeCards, () => {
      this.gameState.players.forEach((player, playerIndex) => {
        const numCards = player.cards.length;
        const cardSpacing = width / 9.4;
        const centerX = playerIndex === 2 ? width / 2 : this.playerPositions[playerIndex].x;
        const revealY = playerIndex === 2
          ? height * 0.75
          : this.playerPositions[playerIndex].y + Math.max(40, height * 0.08);
  
        player.cards.forEach((card, i) => {
          if (playerIndex === 0) return; // skip left player (packed)
  
          const targetX = centerX + (i - (numCards - 1) / 2) * cardSpacing;
  
          this.tweens.add({
            targets: card,
            x: targetX,
            y: revealY,
            scaleX: Math.min(width / 375, height / 667) * 0.4,
            scaleY: Math.min(width / 375, height / 667) * 0.4,
            duration: 600,
            delay: i * 150,
            ease: "Power2",
            onComplete: () => {
              // Flip card
              this.tweens.add({
                targets: card,
                scaleX: 0,
                duration: 200,
                onComplete: () => {
                  this.sound.play("card_flip");
                  card.setTexture(cardNames[playerIndex][i]);
                  this.tweens.add({
                    targets: card,
                    scaleX: Math.min(width / 375, height / 667) * 0.4,
                    duration: 200,
                  });
                },
              });
            },
          });
        });
      });
  
      this.time.delayedCall(2000, () => this.showWinMessage());
    });
  }
  
  

  createTimerAroundPlayer(playerIndex, duration = 6) {
    const pos = this.playerPositions[playerIndex];
    const icon = this.uiElements.players[playerIndex].icon;

    const radius = icon.displayWidth / 2 + 4;
    const lineWidth = 4;

    // Destroy old timer graphics if exists
    if (this.uiElements.players[playerIndex].timerCircle) {
      this.uiElements.players[playerIndex].timerCircle.destroy();
    }

    const timerCircle = this.add.graphics();
    timerCircle.setDepth(60);
    this.uiElements.players[playerIndex].timerCircle = timerCircle;

    let elapsed = 0;
    const total = duration;

    const timerEvent = this.time.addEvent({
      delay: 100,
      repeat: duration * 10 - 1,
      callback: () => {
        elapsed += 0.1;
        const progress = elapsed / total;

        timerCircle.clear();
        timerCircle.fillStyle(0x00ff00, 0.25);
        timerCircle.beginPath();
        timerCircle.moveTo(pos.x, pos.y - 30);
        timerCircle.arc(pos.x, pos.y - 30, radius, -Math.PI / 2, -Math.PI / 2 + progress * Math.PI * 2, false);
        timerCircle.closePath();
        timerCircle.fillPath();

        timerCircle.lineStyle(lineWidth, 0x00ff00);
        timerCircle.beginPath();
        timerCircle.arc(pos.x, pos.y - 30, radius, -Math.PI / 2, -Math.PI / 2 + progress * Math.PI * 2, false);
        timerCircle.strokePath();
      },
      callbackScope: this,
      onComplete: () => {
        timerCircle.destroy();
        this.uiElements.players[playerIndex].timerCircle = null;
        this.uiElements.players[playerIndex].timerEvent = null;
      },
    });

    // ✅ Store the timer event for cleanup
    this.uiElements.players[playerIndex].timerEvent = timerEvent;

    return timerEvent;
  }

  animatePotCollection(width, height) {
    const centerX = width / 2;
    const centerY = height * 0.4;

    const potAmount = this.gameState.pot;
    const perPlayer = this.gameState.bootValue;

    let completed = 0; // track animation completion

    this.gameState.players.forEach((player, index) => {
      const pos = this.playerPositions[index];

      // Bet value text
      const movingText = this.add.text(pos.x, pos.y - 50, `₹${perPlayer.toLocaleString()}`, {
        fontSize: "28px",
        color: "#FFD700",
        fontStyle: "bold",
        stroke: "#000000",
        strokeThickness: 4,
      }).setOrigin(0.5).setAlpha(0);

      // Animate moving text to pot position
      this.tweens.add({
        targets: movingText,
        alpha: { from: 0, to: 1 },
        x: centerX,
        y: centerY,
        scale: { from: 1, to: 0.6 },
        duration: 1700,
        ease: "Sine.easeInOut",
        onComplete: () => {
          movingText.destroy();
          completed++;

          // Once all bets have reached the pot, show final value
          if (completed === this.gameState.players.length) {
            this.time.delayedCall(400, () => {
              this.showPotValue(centerX, centerY, potAmount);
            });
          }
        },
      });
    });
  }

  showWinMessage() {
    const { width, height } = this.scale;

    // Stop all player timers
    Object.values(this.uiElements.players).forEach(playerUI => {
      if (playerUI.timerCircle) playerUI.timerCircle.destroy();
      if (playerUI.timerEvent) playerUI.timerEvent?.remove(false);
    });

    // Hide other buttons
    this.uiElements.showButton?.setVisible(false);
    this.uiElements.chaalButton?.setVisible(false);
    this.uiElements.blindButton?.setVisible(false);

    // --- 🔊 Play Winner Sound ---
    if (!this.winnerSound) {
      this.winnerSound = this.sound.add("winner_sound");
    }
    this.winnerSound.play({ volume: 0.8 });

    // Add Play Again button
    if (!this.uiElements.playAgainButton) {
      const container = this.add.container(width / 2, height * 0.92).setDepth(50);
      const btn = this.add.image(0, 0, "see").setOrigin(0.5).setScale(1.6, 1.2);
      const btnText = this.add.text(0, 0, "Play Again", {
        fontSize: "28px",
        fontStyle: "bold",
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 4,
      }).setOrigin(0.5);

      container.add([btn, btnText]);
      container.setScale(1.2);

      // Interactive area
      const scaledWidth = btn.displayWidth * container.scaleX;
      const scaledHeight = btn.displayHeight * container.scaleY;
      container.setSize(scaledWidth, scaledHeight);
      container.setInteractive(
        new Phaser.Geom.Rectangle(-scaledWidth / 2, -scaledHeight / 2, scaledWidth, scaledHeight),
        Phaser.Geom.Rectangle.Contains
      );

      container.on("pointerdown", () => this.showGameEndMessage());
      this.uiElements.playAgainButton = container;
    } else {
      this.uiElements.playAgainButton.setVisible(true);
    }

    // YOU WON animation
    const youUI = this.uiElements.players[2];
    const cx = youUI.icon.x;
    const cy = youUI.icon.y - youUI.icon.displayHeight / 2;
    const txt = this.add.text(cx, cy - 50, "🎉 YOU WON! 🎉", {
      fontSize: "36px",
      fontStyle: "bold",
      stroke: "#000",
      strokeThickness: 6,
      color: "#00FF00",
      align: "center",
    }).setOrigin(0.5).setScale(0);

    this.tweens.add({ targets: txt, scale: 1, duration: 700, ease: "Back.Out" });

    // Sparkles
    const emitter = this.add.particles(cx, cy, "sparkle", {
      lifespan: { min: 600, max: 1200 },
      speed: { min: 150, max: 350 },
      angle: { min: 0, max: 360 },
      gravityY: 0,
      scale: { start: 2.4, end: 0.5 },
      quantity: 12,
      blendMode: "ADD",
      emitting: false,
    });

    [0, 150, 300, 450, 600].forEach((delay, i) => {
      const offsetX = (i % 2 === 0 ? -50 : 50) * (i > 0 ? 1 : 0);
      const offsetY = (i % 2 === 0 ? -20 : 20) * (i > 0 ? 1 : 0);
      this.time.delayedCall(delay, () => emitter.explode(15, cx + offsetX, cy + offsetY));
    });

    // Animate chips flowing to you
    this.animateWinAmountFlow(234000);

    // Clean up sparkles
    this.time.delayedCall(2500, () => { if (emitter) emitter.destroy(); });

    // Show game end message after delay
    this.time.delayedCall(2000, () => {
      this.showGameEndMessage();
    });
  }

  animateWinAmountFlow(amount) {
    const { width, height } = this.scale;

    // Start from pot position
    const startX = width / 2;
    const startY = height * 0.4; // pot position

    // Target: YOU’s balance text
    const youUI = this.uiElements.players[2];
    const targetX = youUI.statusText.x;
    const targetY = youUI.statusText.y;

    // Hide pot text during chip flow
    if (this.uiElements.potText) {
      this.uiElements.potText.setText(''); // hide it
    }

    // Create a floating chip text
    const chipText = this.add.text(startX, startY, `+₹${amount.toLocaleString()}`, {
      fontSize: "26px",
      color: "#FFD700",
      fontStyle: "bold",
      stroke: "#000000",
      strokeThickness: 4,
    }).setOrigin(0.5);

    // Animate chip flowing
    this.tweens.add({
      targets: chipText,
      x: targetX,
      y: targetY,
      scale: { from: 1, to: 0.6 },
      alpha: { from: 1, to: 0 },
      duration: 1200,
      ease: "Power2",
      onComplete: () => {
        chipText.destroy();

        // Update YOU's balance from 1.3Cr → 1.5Cr
        const oldBalance = parseFloat(this.gameState.players[2].amount.replace(/[^0-9.]/g, ''));
        const newBalance = oldBalance + 0.9;
        this.gameState.players[2].amount = newBalance.toFixed(1) + "Cr";

        // Update statusText
        youUI.statusText.setText(this.gameState.players[2].amount);
      }
    });
  }

  revealYourCards() {

    this.gameState.seeClicked = true; // mark that SEE was clicked
    const { width, height } = this.scale;
    const yourPlayer = this.gameState.players[2]; // "You"
    const cardNames = ["ace", "king", "queen"];

    const centerX = width / 2;
    const cardSpacing = width / 7; // wider space for clarity
    const revealY = height * 0.75; // move slightly upward from bottom

    // Hide/disable SEE button immediately
    if (this.uiElements.seeButtonImage) {
      this.uiElements.seeButtonImage.disableInteractive().setAlpha(0);
    }
    if (this.uiElements.seeButtonText) {
      this.uiElements.seeButtonText.setAlpha(0);
    }

    // Flip cards sequentially
    yourPlayer.cards.forEach((card, i) => {
      this.tweens.add({
        targets: card,
        x: centerX + (i - 1) * cardSpacing,
        y: revealY,
        scaleX: Math.min(width / 375, height / 667) * 0.4,
        scaleY: Math.min(width / 375, height / 667) * 0.4,
        angle: 0,
        duration: 600,
        delay: i * 150,
        ease: "Power2",
        onComplete: () => {
          // Flip animation
          this.tweens.add({
            targets: card,
            scaleX: 0,
            duration: 200,
            onComplete: () => {
              // Play card flip sound
              this.sound.play("card_flip");

              // Change texture to reveal the card
              card.setTexture(cardNames[i]);

              // Scale back to normal
              this.tweens.add({
                targets: card,
                scaleX: Math.min(width / 375, height / 667) * 0.4,
                duration: 200,
                onComplete: () => {
                  // After all cards are revealed, show "pure sequence" animation
                  if (i === yourPlayer.cards.length - 1) {
                    this.showPureSequence();
                  }
                },
              });
            },
          });
        },
      });
    });
  }

  showPureSequence() {
    const { width, height } = this.scale;
  
    // Bottom player position
    const bottomPlayerPos = this.playerPositions[2];
    const textY = bottomPlayerPos.y + 50; // slightly below the cards
    const textX = bottomPlayerPos.x;
  
    // Create a static PURE SEQUENCE text (small, clean)
    const sequenceText = this.add.text(textX, textY, "PURE SEQUENCE", {
      font: "20px Arial Black",  // smaller, neat font
      fill: "#FFD700",
      stroke: "#000000",
      strokeThickness: 3,
      align: "center",
    })
    .setOrigin(0.5)
    .setDepth(100)
    .setAlpha(0);
  
    // Simple fade-in (no bounce or repeat)
    this.tweens.add({
      targets: sequenceText,
      alpha: 1,
      duration: 400,
      ease: "Sine.easeInOut",
    });
  }
  

  createCards(width, height) {
    // Create card stacks for each player with better mobile scaling
    this.gameState.players.forEach((player, playerIndex) => {
      const pos = this.playerPositions[playerIndex];
      const baseWidth = 375;

      const cardScale = Math.min(width / baseWidth, height / 667) * 0.75;

      const cardSpacing = Math.max(15, width / 35);

      const cardOffsetY = Math.max(70, height * 0.12); // increased from 40 / 0.08

      // Create 3 cards for each player - positioned to be always visible
      for (let i = 0; i < 3; i++) {
        const card = this.add
          .image(pos.x + (i - 1) * cardSpacing, pos.y + cardOffsetY, "cardBack")
          .setScale(cardScale)
          .setOrigin(0.5)
          .setVisible(false);

        // store original scale
        card.originalScaleX = cardScale / 1.7;
        card.originalScaleY = cardScale / 1.7;

        player.cards.push(card);
      }
    });
  }

  dealCards() {
    const { width, height } = this.scale;
    const dealerX = width / 2;
    const dealerY = height * 0.25;

    const tweenDuration = 300;
    const delayBetweenCards = 150;

    // Make sure AudioContext is resumed
    if (this.sound.context.state === 'suspended') {
      console.warn("AudioContext suspended! Waiting for user gesture to resume...");
      // You can show a “Tap to Start” overlay here
    }

    this.gameState.players.forEach((player, playerIndex) => {
      player.cards.forEach((card, cardIndex) => {
        card.setPosition(dealerX, dealerY).setVisible(true).setScale(0);

        this.time.delayedCall((playerIndex * 3 + cardIndex) * delayBetweenCards, () => {
          // Play deal sound only if AudioContext is running
          if (this.sound.context.state === 'running') {
            this.sound.play('dealSound', { volume: 0.5 });
          }

          this.tweens.add({
            targets: card,
            x: this.playerPositions[playerIndex].x + (cardIndex - 1) * (width / 40),
            y: this.playerPositions[playerIndex].y + Math.max(40, height * 0.08) + cardIndex * 10,
            scaleX: card.originalScaleX,
            scaleY: card.originalScaleY,
            angle: 0,
            duration: tweenDuration,
            ease: "Power2",
            onComplete: () => {
              if (playerIndex === 2 && cardIndex === player.cards.length - 1) {
                if (this.uiElements.seeButtonImage)
                  this.uiElements.seeButtonImage.setVisible(true).setDepth(50);
                if (this.uiElements.seeButtonText)
                  this.uiElements.seeButtonText.setVisible(true).setDepth(51);
              }
            },
          });
        });
      });
    });

    const totalDealTime = this.gameState.players.length * 3 * delayBetweenCards + tweenDuration;
    this.time.delayedCall(totalDealTime + 200, () => {
      this.startStaticTurnTimers();
    });

    this.gameState.cardsDealt = true;
  }

  startStaticTurnTimers() {
    // Player 0 → 6s
    this.startPlayerTurn(0);

    // After player 0 finishes (6s + 1s buffer)
    this.time.delayedCall(7000, () => {
      this.startPlayerTurn(1, false);
    });

    // After player 1 finishes (another 7s)
    this.time.delayedCall(14000, () => {
      const { width, height } = this.scale;

      // --- Set initial button visibility ---
      if (this.gameState.seeClicked) {
        if (this.uiElements.chaalButton) this.uiElements.chaalButton.setVisible(true).setDepth(50);
        if (this.uiElements.blindButton) this.uiElements.blindButton.setVisible(false);
      } else {
        if (this.uiElements.chaalButton) this.uiElements.chaalButton.setVisible(false);
        if (this.uiElements.blindButton) this.uiElements.blindButton.setVisible(true).setDepth(50);
      }

      // Always show Show button
      if (this.uiElements.showButton) this.uiElements.showButton.setVisible(true).setDepth(50);

      // --- Handle SEE click dynamically ---
      if (this.uiElements.seeButton) {
        this.uiElements.seeButton.off("pointerdown"); // avoid duplicates
        this.uiElements.seeButton.on("pointerdown", () => {
          this.gameState.seeClicked = true;

          // Hide blind, show chaal
          if (this.uiElements.blindButton) this.uiElements.blindButton.setVisible(false);
          if (this.uiElements.chaalButton) this.uiElements.chaalButton.setVisible(true).setDepth(50);
        });
      }

      // Start bottom player turn (2 min)
      this.startPlayerTurn(2, false, 120);

      // Show "Your Turn to Play 👇"
      const turnText = this.add
        .text(width / 2, height * 0.55, "Your Turn to Play 👇", {
          font: "28px Arial",
          fill: "#ffffff",
          fontStyle: "bold",
          align: "center",
        })
        .setOrigin(0.5)
        .setDepth(101);

      // Fade out after a few seconds
      this.tweens.add({
        targets: [turnText],
        alpha: { from: 1, to: 0 },
        delay: 4000,
        duration: 1000,
        onComplete: () => turnText.destroy(),
      });
    });
  }

  startPlayerTurn(playerIndex, shouldPack = true, duration = 6) {
    if (playerIndex > 2) return;

    const pos = this.playerPositions[playerIndex];
    const ui = this.uiElements.players[playerIndex];
    const packFontSize = Math.max(24, Math.min(32, this.scale.width / 18));
    const seenFontSize = Math.max(16, Math.min(24, this.scale.width / 25));

    // Clear previous timers
    Object.values(this.uiElements.players).forEach(p => {
      if (p.timerCircle) {
        p.timerCircle.destroy();
        p.timerCircle = null;
      }
    });

    // Start circular timer
    this.createTimerAroundPlayer(playerIndex, duration);

    // After 3s → show SEEN for first two players
if (duration <= 6) {
  this.time.delayedCall(3000, () => {
      this.add.text(pos.x, pos.y - 20, "SEEN", {
          fontSize: `${seenFontSize}px`,
          color: "#FFFFFF",
          fontStyle: "bold",
          stroke: "#000000",
          strokeThickness: 3,
          backgroundColor: "#FF4500",
          padding: { x: 10, y: 5 },
      }).setOrigin(0.5);

      // Right player special action after SEEN (only first round)
      if (playerIndex === 1 && !shouldPack && !this.gameState.secondRound) {
          this.showChaalAndFlowingWin(pos);
      }
  });
}

  
    // After 5s → show PACKED only if allowed (for first two players)
    if (shouldPack && duration <= 6) {
      this.time.delayedCall(5000, () => {
        this.packPlayer(playerIndex);
      });
    }

    if (playerIndex === 2 && duration === 120) {
      this.time.delayedCall(100000, () => {
        this.add.text(pos.x, pos.y - 60, "Hurry Up!", {
          fontSize: "20px",
          color: "#ff0000",
          fontStyle: "bold",
          stroke: "#000000",
          strokeThickness: 3,
        }).setOrigin(0.5);
      });
    }
  }

  animatePotValue(startValue, endValue, duration = 2000) {
    const potText = this.uiElements.potText;
    if (!potText) {
      console.warn("Pot text not found!");
      return;
    }

    const obj = { value: startValue };

    this.tweens.add({
      targets: obj,
      value: endValue,
      duration: duration,
      ease: "Linear",
      onUpdate: () => {
        potText.setText(`₹${Math.floor(obj.value).toLocaleString()}`);
      },
      onComplete: () => {
        potText.setText(`₹${endValue.toLocaleString()}`);
      }
    });
  }

  showChaalAndFlowingWin(pos, playerIndex = 1, chaalAmount = 156000, newPotValue = null, force = false) {
    const isSecondRound = this.gameState.secondRound === true && this.gameState.chaalClicked === true;
  
    // 🟡 If it's second round after blind+chaal, skip visual chaal animation
    if (isSecondRound) {
      const oldPot = this.gameState.pot;
      this.gameState.pot = newPotValue ?? (oldPot + chaalAmount);
      this.animatePotValue(oldPot, this.gameState.pot, 1000);
      return;
    }
  
    // Normal chaal animation
    if (!this.uiElements.players[playerIndex].chaalCount || force) {
      this.uiElements.players[playerIndex].chaalCount = 0;
    }
  
    const playerData = this.uiElements.players[playerIndex];
    playerData.chaalCount += 1;
  
    let potIncrement;
  
    if (force && newPotValue !== null) {
      potIncrement = newPotValue - this.gameState.pot;
    } else {
      const defaultChaal = chaalAmount;
      if (playerData.chaalCount === 2 && newPotValue !== null) {
        potIncrement = newPotValue - this.gameState.pot;
      } else {
        potIncrement = defaultChaal;
      }
    }
  
    const chaalText = this.add.text(pos.x, pos.y - 20, `chaal  2X`, {
      fontSize: "15px",
      fontStyle: "bold",
      color: "#FFD700",
      stroke: "#FF4500",
      strokeThickness: 4
    }).setOrigin(0.5);
  
    this.tweens.add({
      targets: chaalText,
      scale: { from: 0, to: 1.5 },
      y: pos.y - 50,
      ease: "Back.Out",
      duration: 600,
      yoyo: true,
      onComplete: () => {
        const centerX = this.scale.width / 2;
        const centerY = this.scale.height * 0.4;
  
        const movingText = this.add.text(pos.x, pos.y - 60, `₹${potIncrement.toLocaleString()}`, {
          fontSize: "22px",
          color: "#FFD700",
          fontStyle: "bold",
          stroke: "#000000",
          strokeThickness: 4,
        }).setOrigin(0.5).setAlpha(0);
  
        this.tweens.add({
          targets: movingText,
          alpha: { from: 0, to: 1 },
          x: centerX + Phaser.Math.Between(-20, 20),
          y: centerY + Phaser.Math.Between(-10, 10),
          scale: { from: 1, to: 0.7 },
          duration: 1200,
          ease: "Sine.easeInOut",
          onComplete: () => {
            movingText.destroy();
            const oldPot = this.gameState.pot;
            this.gameState.pot = newPotValue ?? (oldPot + potIncrement);
            this.animatePotValue(oldPot, this.gameState.pot, 2000);
          }
        });
  
        this.time.delayedCall(2500, () => chaalText.destroy());
      }
    });
  }
   

  packPlayer(index) {
    const ui = this.uiElements.players[index];
    const player = this.gameState.players[index];
    const pos = this.playerPositions[index];

    // Dim player and cards
    ui.icon.setAlpha(0.4);
    if (player.cards) player.cards.forEach(card => card.setAlpha(0.3));

    // PACKED text
    const packFontSize = Math.max(24, Math.min(32, this.scale.width / 18));
    this.add.text(pos.x, pos.y + ui.icon.displayHeight / 2 + 10, "PACKED", {
      fontSize: `${packFontSize}px`,
      color: "#000000",
      fontStyle: "bold",
      stroke: "#FF0000",
      strokeThickness: 4,
    }).setOrigin(0.5);

    // Clean up timer circle (if still visible)
    if (ui.timerCircle) {
      ui.timerCircle.destroy();
      ui.timerCircle = null;
    }
  }

  showGameEndMessage() {
    const { width, height } = this.scale;

    // Platform detection
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    let downloadLink = "https://play.google.com/store/apps/details?id=com.octro.teenpatti&hl=en_IN"; // default Android
    if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
      downloadLink = "https://apps.apple.com/in/app/teen-patti-octro-3-patti-rummy/id653418482";
    }

    // ✅ Overlay
    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.8).setDepth(100);

    // Box for highlighting message
    const boxWidth = width * 0.8;
    const boxHeight = height * 0.4;
    const box = this.add.rectangle(width / 2, height / 2, boxWidth, boxHeight, 0x222222, 0.95)
      .setStrokeStyle(4, 0xffffff)
      .setDepth(101)
      .setOrigin(0.5);

    // End text inside the box
    const endText = this.add.text(width / 2, height / 2 - boxHeight * 0.2,
      "Game Complete!\n\nInstall game to play again!", {
      fontSize: "26px",
      color: "#FFFFFF",
      fontStyle: "bold",
      align: "center",
      wordWrap: { width: boxWidth * 0.9 },
    }).setOrigin(0.5).setDepth(102);

    // Download button inside box
    const btnWidth = 220;
    const btnHeight = 60;
    const downloadButton = this.add.rectangle(width / 2, height / 2 + boxHeight * 0.2, btnWidth, btnHeight, 0x00ff00)
      .setDepth(103)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => window.open(downloadLink, "_blank"));

    // Button text
    const btnText = this.add.text(width / 2, height / 2 + boxHeight * 0.2, "DOWNLOAD NOW", {
      fontSize: "20px",
      color: "#000000",
      fontStyle: "bold",
    }).setOrigin(0.5).setDepth(104);

    this.gameState.gameEnded = true;
  }
}
const config = {
  type: Phaser.AUTO,
  parent: "game-container",
  backgroundColor: "#000000",
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: TeenpattiGame,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 },
      debug: false,
    },
  },
};

// Prevent zoom on double tap (mobile)
let lastTouchEnd = 0;
document.addEventListener(
  "touchend",
  (event) => {
    const now = new Date().getTime();
    if (now - lastTouchEnd <= 300) {
      event.preventDefault();
    }
    lastTouchEnd = now;
  },
  false
);

document.addEventListener("contextmenu", (event) => { });
window.game = new Phaser.Game(config);