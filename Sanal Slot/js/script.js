const symbols = [
    { symbol: '🍒', probability: 0.260, payout: 0.03125 },//8 tanesi kazancın bahis değerinin 0.25 katını verir.
    { symbol: '🍊', probability: 0.22, payout: 0.0625 },//8 tanesi kazancın bahis değerinin 0.50 katını verir.
    { symbol: '🍇', probability: 0.165, payout: 0.1 },//8 tanesi kazancın bahis değerinin 0.80 katını verir.
    { symbol: '🍓', probability: 0.07, payout: 0.25 },//8 tanesi kazancın bahis değerinin 2 katını verir.
    { symbol: '🍋', probability: 0.0685714285714286, payout: 0.4375 },//8 tanesi kazancın bahis değerinin 3.5 katını verir.
    { symbol: '🔔', probability: 0.055, payout: 0.500 },//8 tanesi kazancın bahis değerinin 4 katını verir.
    { symbol: '💎', probability: 0.9325, payout: 1 }, //8 tanesi kazancın bahis değerinin 8 katını verir.
];
//buradaki yanlış oranlarının tamamının yüzdelik olarak tam tutması yani (sürekli kiraz patlıyor elmas oyunda neredeyse yok.
//PTR düzeyince bunların ayarlanması lazım belirli bir PTR değeri oluşturulması lazım.


const gridRows = 5;
const gridColumns = 6;
let isGameRunning = false;
let balance = 100;
let bet = 1;
let winInThisRound = 0;
let slotData = [];
let totalWon = 0;

function startGame() {
    if (isGameRunning) return; // Oyun zaten başlamışsa işlem yapma
    const betInput = document.getElementById('betInput');
    bet = parseInt(betInput.value);
    if (bet > balance) {
        alert("Bahis miktarı bakiyeden fazla olamaz!");
        return;
    }

    isGameRunning = true;
    balance -= bet; // Bahis miktarını bakiyeden düş
    updateBalance();

    const slotsContainer = document.getElementById('slots');
    slotsContainer.innerHTML = '';
    slotData = [];

    for (let row = 0; row < gridRows; row++) {
        for (let col = 0; col < gridColumns; col++) {
            const randomSymbol = getRandomSymbol();
            slotData.push(randomSymbol);
            const slotElement = document.createElement('div');
            slotElement.classList.add('slot');
            slotElement.textContent = randomSymbol;
            slotsContainer.appendChild(slotElement);
        }
        slotsContainer.appendChild(document.createElement('br'));
    }

    animateSlots(slotData, 0);
}

function resetGame() {
    isGameRunning = false;
    winInThisRound = 0;
    const winBox = document.getElementById('winBox');
    winBox.textContent = 'Kazanç: 0 TL';
    const slotsContainer = document.getElementById('slots');
    slotsContainer.innerHTML = '';
    balance = 100; // Oyun sıfırlandığında bakiyeyi 100 TL'ye ayarla
    updateBalance();
}

function getRandomSymbol() {
    const totalProbability = symbols.reduce((sum, symbol) => sum + symbol.probability, 0);
    const randomValue = Math.random();

    let cumulativeProbability = 0;
    for (const symbol of symbols) {
        cumulativeProbability += symbol.probability / totalProbability;
        if (randomValue <= cumulativeProbability) {
            return symbol.symbol;
        }
    }

    // Eğer bir sembol seçilemediyse (örneğin olasılıklar toplamı 1 değil), son sembolü döndürürüz.
    return symbols[symbols.length - 1].symbol;
}

function animateSlots(slotData, currentIndex) {
    const slotsContainer = document.getElementById('slots');
    const slots = slotsContainer.getElementsByClassName('slot');

    // Önceki dönme animasyonunu kaldır
    for (let i = 0; i < slotData.length; i++) {
        slots[i].classList.remove('rotate-animation');
    }

    // Şu anki sembolleri ekranda göster
    for (let i = 0; i < slotData.length; i++) {
        slots[i].textContent = slotData[i];
    }

    // Sonraki dönme animasyonunu ekle
    const symbol = slotData[currentIndex];
    slots[currentIndex].classList.add('rotate-animation');

    setTimeout(function () {
        slots[currentIndex].classList.remove('rotate-animation');
        currentIndex++;
        if (currentIndex < slotData.length) {
            animateSlots(slotData, currentIndex);
        } else {
            checkWin(slotData);
        }
    }, 1.5); // sonra bir sonraki sembole geç
}

function checkWin(slotData) {
    let changed = false;
    let symbolsToAnimate = new Set();

    for (let i = 0; i < slotData.length; i++) {
        const symbolToCheck = slotData[i];
        let count = 0;

        for (let j = 0; j < slotData.length; j++) {
            if (slotData[j] === symbolToCheck) {
                count++;
            }
        }

        if (count >= 8) {
            changed = true;
            symbolsToAnimate.add(symbolToCheck);
            winInThisRound += calculateWinAmount(symbolToCheck) * bet;
        }
    }

    const slotsContainer = document.getElementById('slots');
    const slots = slotsContainer.getElementsByClassName('slot');
    for (let i = 0; i < slotData.length; i++) {
        const symbol = slotData[i];
        slots[i].textContent = symbol;

        if (symbolsToAnimate.has(symbol)) {
            slots[i].classList.add('rotate-animation'); // 8 veya daha fazla sembol varsa animasyonu ekle
        } else {
            slots[i].classList.remove('rotate-animation'); // Değilse animasyonu kaldır
        }
    }

    if (changed) {
        setTimeout(function () {
            for (let i = 0; i < slotData.length; i++) {
                const symbol = slotData[i];
                if (symbolsToAnimate.has(symbol)) {
                    slotData[i] = getRandomSymbol(); // 8 veya daha fazla sembolün yerine rastgele sembol yerleştir
                }
            }
            animateSlots(slotData, 0);
        }, 2000); // 2 saniye sonra yeni dönüş başlasın
    } else {
        
        isGameRunning = false;
        totalWon += winInThisRound;
        balance += winInThisRound; // Kazanç bakiyeye ekle
         winInThisRound = 0; // Tur sonundaki kazançları sıfırla
        updateBalance();
        setTimeout(function() {
            totalWon =0;
            updateBalance();
        },150 )
        updateCurrentWin();
    }
}



function calculateWinAmount(symbol) {
    const symbolInfo = symbols.find((s) => s.symbol === symbol);
    return symbolInfo ? symbolInfo.payout : 0;
}

function updateBalance() {
    const balanceElement = document.getElementById('balance');
    balanceElement.textContent = `Bakiye: ${balance.toFixed(2)} TL`;
}

function updateCurrentWin() {
    const currentWinElement = document.getElementById('currentWin');
    currentWinElement.textContent = totalWon.toFixed(2);
}

function calculateRTP(symbols) {
    let totalProbability = 0;
    let totalPayout = 0;

    // Tüm sembollerin çıkma olasılıklarını ve ödeme değerlerini döngüyle toplarız
    for (const symbol of symbols) {
        totalProbability += symbol.probability;
        totalPayout += symbol.payout * symbol.probability;
    }

    // Toplam olasılığı 1'e böleriz (normalleştirme)
    totalProbability = totalProbability / symbols.length;

    // RTP oranını hesaplarız ve yüzde olarak döndürürüz
    const rtp = (totalPayout / totalProbability) * 100;
    return rtp.toFixed(2); // Ondalık kısmı iki basamakla sınırlarız
}

const rtpValue = calculateRTP(symbols);
console.log("RTP Oranı: %", rtpValue);

