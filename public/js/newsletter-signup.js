// Wires up the newsletter signup form: posts to /api/subscribe as JSON,
// shows an inline error or a clean success state, and disables the submit
// button while a request is in flight. Does nothing on pages without the
// form. Vanilla JS, no dependencies.
document.addEventListener('DOMContentLoaded', function () {
  var form = document.getElementById('newsletter-signup-form');
  if (!form) return;

  var message = document.getElementById('newsletter-signup-message');
  var successBlock = document.getElementById('newsletter-signup-success');
  var submitBtn = form.querySelector('button[type="submit"]');
  var consecutiveFailures = 0;

  function showError(text) {
    consecutiveFailures++;
    message.textContent = '';
    message.appendChild(document.createTextNode(text));
    if (consecutiveFailures >= 2) {
      var fallback = document.createElement('span');
      fallback.innerHTML = ' Still not working? Email <a href="mailto:stmartin.chelsfield@btinternet.com">stmartin.chelsfield@btinternet.com</a> and we’ll add you by hand.';
      message.appendChild(fallback);
    }
    message.hidden = false;
    message.classList.add('is-error');
    message.classList.remove('is-success');
  }

  function showSuccess(text) {
    consecutiveFailures = 0;
    message.hidden = true;
    form.hidden = true;
    successBlock.textContent = text;
    successBlock.hidden = false;
    successBlock.focus();
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    var email = form.elements.email.value.trim();
    var name = form.elements.name.value.trim();
    var website = form.elements.website.value; // honeypot — left blank by real visitors
    var consent = form.elements.consent.checked;

    if (!consent) {
      showError('Please tick the box to confirm you’d like to receive updates.');
      return;
    }

    submitBtn.disabled = true;
    fetch('/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email, name: name, website: website }),
    })
      .then(function (res) { return res.json().then(function (data) { return { status: res.status, data: data }; }); })
      .then(function (result) {
        if (result.data.ok) {
          showSuccess(result.data.message);
        } else {
          showError(result.data.message);
        }
      })
      .catch(function () {
        showError('Something went wrong on our end — please try again shortly.');
      })
      .then(function () {
        submitBtn.disabled = false;
      });
  });
});
