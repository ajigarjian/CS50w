document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', () => compose_email());

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email(recipients, subject, body) {

  recipients = recipients || '';
  subject = subject || '';
  body = body || '';

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#email-view').innerHTML='';
  document.querySelector('#compose-view').style.display = 'block';

  const recipients_field = document.querySelector('#compose-recipients');
  const subject_field = document.querySelector('#compose-subject');
  const body_field = document.querySelector('#compose-body');

  // Clear out composition fields
  recipients_field.value = `${recipients}`;
  subject_field.value = `${subject}`;
  body_field.value = `${body}`;

  // perform these actions when the compose form is submitted:
  document.querySelector('#compose-form').onsubmit = () => {

    //store compose form values as variables for easier access
    const recipients = recipients_field.value;
    const subject = subject_field.value;
    const body = body_field.value;

    // Create a JSON object using the form's filled out values and POST it to the /emails route using fetch
    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
          recipients: recipients,
          subject: subject,
          body: body,
          read: false
      })
    })

    .then(response => response.json())
    .then(result => {
        // Print result
        console.log(result);
    });

    // fetch('/emails/inbox')
    // .then(response => response.json())
    // .then(emails => {
    //   for (i=0; i<emails.length; i++) {


        
    //     if (i==0) {

    //       id = emails[i].id;

    //       fetch(`/emails/${id}`, {
    //         method: 'PUT',
    //         body: JSON.stringify({
    //             read: false
    //         })
    //       })
    //     }
        
    //   }
    // });

    // Clear out composition fields
    recipients_field.value = '';
    subject_field.value = '';
    body_field.value = '';

    //load the mailbox after email successfully sent
    setTimeout(function(){ 
      load_mailbox('inbox'); 
    }, 100);

    // Stop form from submitting
    return false;
    
  }
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#email-view').innerHTML='';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // //Depending on the button clicked, (e.g. the event triggered), manipulate the DOM to show different content:

  // //If load_mailbox(inbox) is invoked (e.g. the mailbox input is equal to the inbox), show the mailbox contents via API call
    if (mailbox == 'inbox') {

      fetch('/emails/inbox')
      .then(response => response.json())
      .then(emails => {

        console.log(emails)
        
          //for each email...
          for (i = 0; i < emails.length; i++) {

            //create a div with its own border and populate it's text as displays who its from, what the subject line is, and the timestamp
            const box = document.createElement('div');
            box.setAttribute('id', emails[i].id);
            box.classList.add('email_box');

            box.style.textAlign = 'center';

            const sender = document.createElement('span');
            const subject = document.createElement('span');
            const timestamp = document.createElement('span');

            sender.innerHTML = `${emails[i].sender}`
            subject.innerHTML = `Subject: ${emails[i].subject}`
            timestamp.innerHTML = `${emails[i].timestamp}`

            sender.style.float="left";
            sender.style.fontWeight="bold";
            subject.style.float="center";
            timestamp.style.float="right";
            
            box.appendChild(sender);
            box.appendChild(subject);
            box.appendChild(timestamp);

            document.querySelector('#emails-view').appendChild(box);

            box.onclick = () => {

              fetch(`/emails/${box.id}`)
              .then(response => response.json())
              .then(email => {

                console.log(email.subject);

                  // collapse the other divs and show the email div
                  document.querySelector('#emails-view').style.display = 'none';
                  document.querySelector('#email-view').style.display = 'block';

                  // manipulate the DOM to add the content of the fetched (clicked) email
                  const email_sender = document.createElement('text');
                  const email_recipients = document.createElement('text');
                  const email_subject = document.createElement('text');
                  const email_timestamp = document.createElement('text');
                  const email_body = document.createElement('text');
                  const reply_button = document.createElement('button');

                  reply_button.setAttribute('class', 'btn btn-sm btn-outline-primary');
                  reply_button.setAttribute('id', 'reply-button');

                  email_sender.innerHTML = `From: ${email.sender}`;
                  email_recipients.innerHTML = `To: ${email.recipients}`;
                  email_subject.innerHTML = `Subject: ${email.subject}`;
                  email_timestamp.innerHTML = `Timestamp: ${email.timestamp}`;
                  email_body.innerHTML = `${email.body}`
                  reply_button.innerHTML = 'Reply';

                  content_rows = [email_sender, email_recipients, email_subject, email_timestamp, reply_button, email_body];

                  for (i = 0; i < content_rows.length; i++) {
                    document.querySelector('#email-view').appendChild(content_rows[i]);

                    if (content_rows[i] === reply_button) {
                      const hr = document.createElement("hr");
                      document.querySelector('#email-view').appendChild(hr);
                    }

                    else {
                      const br = document.createElement("br");
                      document.querySelector('#email-view').appendChild(br);
                    }
                  }
                  
                  if (email.subject.slice(0, 2) == "Re") {
                    document.querySelector('#reply-button').addEventListener('click', () => compose_email(email.sender, `${email.subject}`, `On ${email.timestamp} ${email.sender} wrote: ${email.body}`));
                  }
                  else {
                    document.querySelector('#reply-button').addEventListener('click', () => compose_email(email.sender, `Re: ${email.subject}`, `On ${email.timestamp} ${email.sender} wrote: ${email.body}`));
                  }
                  
              });
            }

          }
      });

    }
}