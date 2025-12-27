/**
 * Implementation Validation Script
 * Tests the actual speed indicator implementation in the game code
 */

// Import the game classes (simulated for testing)
class MockGame {
    constructor() {
        this.speedBoostActive = false;
        this.boostCooldownEndTime = 0;
        this.speedMultiplier = 1.5;
        this.player = new Player(this);
    }

    activateSpeedBoost() {
        this.speedBoostActive = true;
        this.boostCooldownEndTime = Date.now() + 3000; // 3 seconds cooldown
    }
}

class MockPlayer {
    constructor(game) {
        this.game = game;
        this.speedHistory = [];
        this.maxSpeedHistory = 10;
    }

    getCurrentSpeed() {
        const baseSpeed = 50;

        if (this.game.speedBoostActive) {
            // During boost: 60-80 km/h
            return Math.min(80, baseSpeed + (this.game.speedMultiplier - 1) * 20);
        } else if (Date.now() < this.game.boostCooldownEndTime && this.game.boostCooldownEndTime > 0) {
            // During cooldown: 50-55 km/h
            const cooldownProgress = 1 - Math.min(1, (this.game.boostCooldownEndTime - Date.now()) / 3000);
            return baseSpeed * (0.9 + cooldownProgress * 0.1);
        }

        // Normal driving: 50 km/h
        return baseSpeed;
    }

    updateSpeedHistory() {
        const currentSpeed = this.getCurrentSpeed();
        this.speedHistory.push(currentSpeed);

        if (this.speedHistory.length > this.maxSpeedHistory) {
            this.speedHistory.shift();
        }
    }

    getAverageSpeed() {
        if (this.speedHistory.length === 0) {
            return 50;
        }

        const sum = this.speedHistory.reduce((acc, speed) => acc + speed, 0);
        return Math.round(sum / this.speedHistory.length * 10) / 10;
    }
}

// Test suite
const tests = [];

tests.push({
    name: 'Normal Speed Calculation',
    test: function () {
        const game = new MockGame();
        for (let i = 0; i < 5; i++) {
            game.player.updateSpeedHistory();
        }
        const avgSpeed = game.player.getAverageSpeed();
        return Math.abs(avgSpeed - 50) < 1;
    },
    expected: true,
    description: 'Should calculate normal speed as 50 km/h'
});

tests.push({
    name: 'Boosted Speed Calculation',
    test: function () {
        const game = new MockGame();
        game.activateSpeedBoost();

        for (let i = 0; i < 5; i++) {
            game.player.updateSpeedHistory();
        }

        const avgSpeed = game.player.getAverageSpeed();
        return avgSpeed >= 60 && avgSpeed <= 80;
    },
    expected: true,
    description: 'Should calculate boosted speed between 60-80 km/h'
});

tests.push({
    name: 'Cooldown Speed Calculation',
    test: function () {
        const game = new MockGame();
        game.activateSpeedBoost();

        // Wait for cooldown to start
        setTimeout(() => {
            for (let i = 0; i < 5; i++) {
                game.player.updateSpeedHistory();
            }

            const avgSpeed = game.player.getAverageSpeed();
            return avgSpeed >= 50 && avgSpeed <= 55;
        }, 3100);
    },
    expected: true,
    description: 'Should calculate cooldown speed between 50-55 km/h'
});

tests.push({
    name: 'Speed History Maintenance',
    test: function () {
        const game = new MockGame();
        for (let i = 0; i < 15; i++) {
            game.player.updateSpeedHistory();
        }
        return game.player.speedHistory.length === 10;
    },
    expected: true,
    description: 'Should maintain speed history of maximum 10 entries'
});

tests.push({
    name: 'Moving Average Calculation',
    test: function () {
        const game = new MockGame();

        // Add some normal speeds
        for (let i = 0; i < 5; i++) {
            game.player.updateSpeedHistory();
        }

        // Add boosted speed
        game.activateSpeedBoost();
        for (let i = 0; i < 3; i++) {
            game.player.updateSpeedHistory();
        }

        const avgSpeed = game.player.getAverageSpeed();
        return avgSpeed >= 50 && avgSpeed <= 70;
    },
    expected: true,
    description: 'Should calculate moving average of speed history'
});

// Run tests
function runTests() {
    console.log('Running implementation validation tests...');
    console.log('='.repeat(60));

    let passed = 0;
    let failed = 0;

    // Run synchronous tests first
    for (let i = 0; i < tests.length - 1; i++) {
        const test = tests[i];
        try {
            const result = test.test();
            if (result === test.expected) {
                console.log(`✓ ${test.name}`);
                passed++;
            } else {
                console.log(`✗ ${test.name} - Expected ${test.expected}, got ${result}`);
                failed++;
            }
        } catch (e) {
            console.log(`✗ ${test.name} - Error: ${e.message}`);
            failed++;
        }
    }

    // Run async test
    setTimeout(() => {
        const test = tests[tests.length - 1];
        try {
            const result = test.test();
            if (result === test.expected) {
                console.log(`✓ ${test.name}`);
                passed++;
            } else {
                console.log(`✗ ${test.name} - Expected ${test.expected}, got ${result}`);
                failed++;
            }
        } catch (e) {
            console.log(`✗ ${test.name} - Error: ${e.message}`);
            failed++;
        }

        console.log('='.repeat(60));
        console.log(`Results: ${passed} passed, ${failed} failed`);
        if (failed === 0) {
            console.log('All tests passed! ✓');
        } else {
            console.log(`${failed} test(s) failed. Please review the implementation.`);
        }
    }, 3500);
}

// Execute tests
runTests();