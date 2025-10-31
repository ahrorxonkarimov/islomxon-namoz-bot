let currentUser = null;
let currentLanguage = 'uz';

// ADMIN TEKSHIRISH
async function checkAdmin() {
    const userId = document.getElementById('userId').value;
    
    if (!userId) {
        showResult('Iltimos, Telegram ID ni kiriting!', 'error');
        return;
    }

    try {
        const response = await fetch('/api/check-admin', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId: parseInt(userId) })
        });

        const result = await response.json();

        if (result.success) {
            currentUser = { id: userId, isAdmin: true };
            document.getElementById('loginScreen').style.display = 'none';
            document.getElementById('adminPanel').style.display = 'block';
            document.getElementById('userWelcome').textContent = `Admin: ${userId}`;
            loadPrayerTimes();
        } else {
            showResult(result.message, 'error');
        }
    } catch (error) {
        showResult('Server xatosi!', 'error');
    }
}

// CHIQISH
function logout() {
    currentUser = null;
    document.getElementById('adminPanel').style.display = 'none';
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('userId').value = '';
}

// NAMOZ VAQTLARINI YUBORISH
document.getElementById('prayerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!currentUser || !currentUser.isAdmin) {
        showResult('Sizda admin huquqi yoʻq!', 'error');
        return;
    }

    const formData = {
        date: document.getElementById('date').value,
        bomdod: document.getElementById('bomdod').value,
        peshin: document.getElementById('peshin').value,
        asr: document.getElementById('asr').value,
        shom: document.getElementById('shom').value,
        xufton: document.getElementById('xufton').value,
        lang: currentLanguage,
        userId: parseInt(currentUser.id)
    };

    try {
        const response = await fetch('/api/prayer-times', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        const result = await response.json();
        showResult(result.message, result.success ? 'success' : 'error');
        
    } catch (error) {
        showResult('Xatolik yuz berdi!', 'error');
    }
});

// QOLGAN KODLAR O'ZGARMASDI...
// (loadPrayerTimes, changeLanguage, showResult funksiyalari oldingidek qoladi)
