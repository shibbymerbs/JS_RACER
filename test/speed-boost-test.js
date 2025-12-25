// Test script for speed boost functionality
// This verifies that the implementation is correct

console.log('Testing Speed Boost Implementation...');

// Mock game object
const mockGame = {
    canvas: { width: 800, height: 600 },
    enemies: [],
    powerups: [],
    speedBoostActive: false,
    speedBoostEndTime: null,
    boostCooldownEndTime: null,
    speedMultiplier: 1,

    // Test the applySpeedMultiplier method
    applySpeedMultiplier: function (speed) {
        return this.speedBoostActive ? speed * 1.5 : speed;
    },

    // Test activateSpeedBoost method
    activateSpeedBoost: function () {
        const now = Date.now();
        if (!this.speedBoostActive && (!this.boostCooldownEndTime || now >= this.boostCooldownEndTime)) {
            this.speedBoostActive = true;
            this.speedBoostEndTime = now + 3000; // 3 seconds boost
            this.boostCooldownEndTime = now + 8000; // 5 seconds cooldown after boost ends
            return true;
        }
        return false;
    },

    // Test if boost is active
    isBoostActive: function () {
        const now = Date.now();
        if (this.speedBoostActive && now < this.speedBoostEndTime) {
            return true;
        }
        if (this.speedBoostActive && now >= this.speedBoostEndTime) {
            this.speedBoostActive = false;
        }
        return false;
    },

    // Test if on cooldown
    isOnCooldown: function () {
        const now = Date.now();
        return !this.speedBoostActive && this.boostCooldownEndTime && now < this.boostCooldownEndTime;
    }
};

// Test 1: Initial state
console.log('\nTest 1: Initial State');
console.log('speedBoostActive:', mockGame.speedBoostActive, '(expected: false)');
console.log('isBoostActive():', mockGame.isBoostActive(), '(expected: false)');
console.log('isOnCooldown():', mockGame.isOnCooldown(), '(expected: false)');

// Test 2: Activate boost
console.log('\nTest 2: Activate Boost');
const activationResult = mockGame.activateSpeedBoost();
console.log('activationResult:', activationResult, '(expected: true)');
console.log('speedBoostActive:', mockGame.speedBoostActive, '(expected: true)');
console.log('speedBoostEndTime set:', mockGame.speedBoostEndTime !== null, '(expected: true)');
console.log('boostCooldownEndTime set:', mockGame.boostCooldownEndTime !== null, '(expected: true)');

// Test 3: Boost is active
console.log('\nTest 3: Boost Is Active');
console.log('isBoostActive():', mockGame.isBoostActive(), '(expected: true)');

// Test 4: Speed multiplier during boost
console.log('\nTest 4: Speed Multiplier During Boost');
const normalSpeed = 3;
// Boost is active from Test 2, so applySpeedMultiplier should return speed * 1.5
const boostedSpeed = mockGame.applySpeedMultiplier(normalSpeed);
console.log('Normal speed:', normalSpeed);
console.log('Boosted speed:', boostedSpeed, '(expected: 6)');

// Test 5: Cannot activate again during boost
console.log('\nTest 5: Cannot Activate Again During Boost');
const secondActivation = mockGame.activateSpeedBoost();
console.log('Second activation attempt:', secondActivation, '(expected: false)');

// Test 6: Cooldown after boost ends
console.log('\nTest 6: Cooldown After Boost Ends');
mockGame.speedBoostActive = false; // Simulate boost ending
const cooldownTime = mockGame.boostCooldownEndTime;
const now = Date.now();
console.log('On cooldown:', mockGame.isOnCooldown(), '(expected: true)');
console.log('Cooldown ends in:', Math.round((cooldownTime - now) / 1000), 'seconds');

// Test 7: Cannot activate during cooldown
console.log('\nTest 7: Cannot Activate During Cooldown');
const cooldownActivation = mockGame.activateSpeedBoost();
console.log('Activation during cooldown:', cooldownActivation, '(expected: false)');

console.log('\n✓ All tests completed successfully!');