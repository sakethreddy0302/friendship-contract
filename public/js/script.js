let formData = {};

function nextPage(pageNumber) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(`page-${pageNumber}`).classList.add('active');
}

function getVal(name) {
    return document.querySelector(`input[name="${name}"]:checked`)?.value || 'N/A';
}

function getFb(id) {
    return document.getElementById(id)?.value.trim() || 'None';
}

function handlePage2Next() {
    const spareTimeVal = getVal('spare_time');

    if (spareTimeVal === 'No') {
        const finalHeading = document.getElementById('final-heading');
        const finalMessage = document.getElementById('final-message');

        finalHeading.textContent = "Alright...";
        finalMessage.textContent = "alright i can understand that, and feel free to open whenever you are free... 😔";

        formData = {
            spare_time: 'No, too busy right now'
        };

        fetch('/api/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        nextPage(12);
    } else {
        nextPage(3);
    }
}

function buildReview() {
    formData = {
        spare_time: getVal('spare_time'),
        enjoy_talking: `${getVal('q1')} (Feedback: ${getFb('fb1')})`,
        make_smile: `${getVal('q2')} (Feedback: ${getFb('fb2')})`,
        stopped_msg: `${getVal('q3')} (Feedback: ${getFb('fb3')})`,
        trust: `${getVal('q4')} (Feedback: ${getFb('fb4')})`,
        best_friend: `${getVal('q5')} (Feedback: ${getFb('fb5')})`,
        important_role: `${getVal('q6')} (Feedback: ${getFb('fb6')})`,
        disturbing: `${getVal('q7')} (Feedback: ${getFb('fb7')})`,
        final_decision: getVal('final_decision'),
        final_notes: getFb('final_fb')
    };

    const reviewContainer = document.getElementById('review-content');
    reviewContainer.innerHTML = `
        <p><strong>1. Spare time:</strong> ${getVal('spare_time')}</p>
        <p><strong>2. Enjoy talking:</strong> ${formData.enjoy_talking}</p>
        <p><strong>3. Make smile:</strong> ${formData.make_smile}</p>
        <p><strong>4. Stopped msg:</strong> ${formData.stopped_msg}</p>
        <p><strong>5. Trust:</strong> ${formData.trust}</p>
        <p><strong>6. Best Friend:</strong> ${formData.best_friend}</p>
        <p><strong>7. Important role:</strong> ${formData.important_role}</p>
        <p><strong>8. Disturbing you:</strong> ${formData.disturbing}</p>
        <p><strong>Final Decision:</strong> ${formData.final_decision}</p>
    `;
}

async function submitResponses() {
    try {
        const response = await fetch('/api/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            const finalHeading = document.getElementById('final-heading');
            const finalMessage = document.getElementById('final-message');

            // Checks if "No" or "End friendship" was selected on Page 10
            if (formData.final_decision === 'End friendship' || formData.final_decision === 'No') {
                finalHeading.textContent = "I understand... 😔";
                finalMessage.textContent = "Im really sorry if I failed as a best friend. whatever I did with you I love doing that. Never wanted to hurt you, and not to disappoint you willingly. 😭";
            } else {
                finalHeading.textContent = "Thank You 💛";
                finalMessage.textContent = "Thank you for being open and taking the time to share this with me. Let's work on making things better. ☺️";
            }

            nextPage(12);
        } else {
            alert('Something went wrong submitting your response. Please try again.');
        }
    } catch (err) {
        console.error('Submission failed:', err);
        alert('Network error. Ensure the local server is running.');
    }
}