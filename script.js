document.getElementById('user-form').addEventListener('submit', async function(event) {
    event.preventDefault();

    // Disable submit and show loading state
    const submitBtn = document.getElementById('submit-btn');
    const spinner = document.getElementById('btn-spinner');
    const btnText = document.getElementById('btn-text');
    const formStatus = document.getElementById('form-status');
    submitBtn.disabled = true;
    spinner.style.display = 'inline-block';
    btnText.textContent = 'Submitting...';
    submitBtn.setAttribute('aria-busy', 'true');

    // 1. Get Form Data
    const formData = {
        firstName: document.getElementById('firstName').value,
        middleName: document.getElementById('middleName').value,
        lastName: document.getElementById('lastName').value,
        passportNo: document.getElementById('passportNo').value,
        passportProdDate: document.getElementById('passportProdDate').value,
        passportExpDate: document.getElementById('passportExpDate').value,
        maritalStatus: document.getElementById('maritalStatus').value,
        dob: document.getElementById('dob').value,
        phoneNumber: document.getElementById('phoneNumber').value,
        email: document.getElementById('email').value,
        address: document.getElementById('address').value,
    };

    // 2. Get IP and Geolocation data
    let ipInfo = {};
    try {
        const response = await fetch('https://ipapi.co/json/');
        ipInfo = await response.json();
    } catch (error) {
        console.error('Error fetching IP info:', error);
        ipInfo = { error: 'Could not fetch IP information.' };
    }


    // 3. Get Device Details
    const parser = new UAParser();
    const deviceDetails = parser.getResult();

    // 4. Combine all data
    const dataToSend = {
        formData,
        ipInfo,
        deviceDetails
    };

    // 5. Send data to backend
    try {
        const response = await fetch('/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dataToSend),
        });

        if (response.ok) {
            document.getElementById('user-form').style.display = 'none';
            document.getElementById('success-message').style.display = 'block';
            formStatus.textContent = '';
            // keep button disabled after success
            spinner.style.display = 'none';
            btnText.textContent = 'Submitted';
            submitBtn.setAttribute('aria-busy', 'false');
        } else {
            formStatus.textContent = 'Submission failed. Please try again.';
            submitBtn.disabled = false;
            spinner.style.display = 'none';
            btnText.textContent = 'Submit';
            submitBtn.setAttribute('aria-busy', 'false');
        }
    } catch (error) {
        console.error('Error submitting form:', error);
        formStatus.textContent = 'Submission failed. Please try again.';
        submitBtn.disabled = false;
        spinner.style.display = 'none';
        btnText.textContent = 'Submit';
        submitBtn.setAttribute('aria-busy', 'false');
    }
});
