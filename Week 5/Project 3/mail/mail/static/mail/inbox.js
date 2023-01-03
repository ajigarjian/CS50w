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
    });

    // Clear out composition fields
    recipients_field.value = '';
    subject_field.value = '';
    body_field.value = '';

    //load the sent mailbox after email successfully sent
    setTimeout(function(){ 
      load_mailbox('sent'); 
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

        console.log(emails);
        
          //for each email...
          for (i = 0; i < emails.length; i++) {

            // if the email is not archived...
            if (emails[i].archived == false) {

              //create a div with its own border and populate it's text as displays who its from, what the subject line is, and the timestamp
              
              //parent div acting as a flex container for each row
              const row = document.createElement('row');
              row.style.display ="flex"; //make the parent flex so the child divs are side by side
              row.setAttribute('class', 'row_box'); //add padding, margin, etc to each row

              //box containing email info, and archive button
              const archive = document.createElement('button');
              archive.setAttribute('class', 'btn btn-sm btn-outline-primary');
              archive.innerHTML = 'Archive';

              //box containing email info
              const box = document.createElement('div');
              box.setAttribute('id', emails[i].id); //set id
              box.classList.add('email_box'); //set box style

              //if the email has been read, add the gray background using the 'read' css class
              if (emails[i].read === true) {
                box.classList.add('read');
              }

              box.style.textAlign = 'center';

              const sender = document.createElement('span');
              const subject = document.createElement('span');
              const timestamp = document.createElement('span');

              sender.innerHTML = `From: ${emails[i].sender}`
              subject.innerHTML = `Subject: ${emails[i].subject}`
              timestamp.innerHTML = `${emails[i].timestamp}`

              sender.style.float="left";
              sender.style.fontWeight="bold";
              subject.style.float="center";
              timestamp.style.float="right";
              
              box.appendChild(sender);
              box.appendChild(subject);
              box.appendChild(timestamp);

              row.appendChild(box);
              row.appendChild(archive);
              document.querySelector('#emails-view').appendChild(row);

              box.onclick = () => {

                fetch(`/emails/${box.id}`)
                .then(response => response.json())
                .then(email => {

                  //mark email as read once it opened clicked on the inbox page
                  fetch(`/emails/${box.id}`, {
                    method: 'PUT',
                    body: JSON.stringify({
                        read: true
                    })
                  });

                  console.log(email);

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

              archive.onclick = () => {
                //mark email as archived once it's archived button is clicked
                fetch(`/emails/${box.id}`, {
                  method: 'PUT',
                  body: JSON.stringify({
                      archived: true
                  })
                });

                setTimeout(function() {
                  load_mailbox('inbox');
                }, 100);

              }
            }
          }
      });

    }

     //once you click the sent button, and load_mailbox('sent is called), show the Sent mailbox content
     else if (mailbox == 'sent') {

      fetch('/emails/sent')
      .then(response => response.json())
      .then(emails => {
        
          //for each email...
          for (i = 0; i < emails.length; i++) {

            //create a div with its own border and populate it's text as displays who its from, what the subject line is, and the timestamp
            const box = document.createElement('div');
            box.setAttribute('id', emails[i].id);
            box.classList.add('email_box');

            box.style.textAlign = 'center';

            const recipients = document.createElement('span');
            const subject = document.createElement('span');
            const timestamp = document.createElement('span');

            recipients.innerHTML = `To: ${emails[i].recipients}`
            subject.innerHTML = `Subject: ${emails[i].subject}`
            timestamp.innerHTML = `${emails[i].timestamp}`

            recipients.style.float="left";
            recipients.style.fontWeight="bold";
            subject.style.float="center";
            timestamp.style.float="right";
            
            box.appendChild(recipients);
            box.appendChild(subject);
            box.appendChild(timestamp);

            document.querySelector('#emails-view').appendChild(box);

            box.onclick = () => {

              fetch(`/emails/${box.id}`)
              .then(response => response.json())
              .then(email => {

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

     // //If load_mailbox(inbox) is invoked (e.g. the mailbox input is equal to the inbox), show the mailbox contents via API call
    if (mailbox == 'archive') {

      fetch('/emails/archive')
      .then(response => response.json())
      .then(emails => {

        console.log(emails);
        
          //for each email...
          for (i = 0; i < emails.length; i++) {

            // if the email is not archived...
            if (emails[i].archived == true) {

              //create a div with its own border and populate it's text as displays who its from, what the subject line is, and the timestamp
              
              //parent div acting as a flex container for each row
              const row = document.createElement('row');
              row.style.display ="flex"; //make the parent flex so the child divs are side by side
              row.setAttribute('class', 'row_box'); //add padding, margin, etc to each row

              //box containing email info, and archive button
              const archive = document.createElement('button');
              archive.setAttribute('class', 'btn btn-sm btn-outline-primary');
              archive.innerHTML = 'Unarchive';

              //box containing email info
              const box = document.createElement('div');
              box.setAttribute('id', emails[i].id); //set id
              box.classList.add('email_box'); //set box style

              //if the email has been read, add the gray background using the 'read' css class
              if (emails[i].read === true) {
                box.classList.add('read');
              }

              box.style.textAlign = 'center';

              const sender = document.createElement('span');
              const subject = document.createElement('span');
              const timestamp = document.createElement('span');

              sender.innerHTML = `From: ${emails[i].sender}`
              subject.innerHTML = `Subject: ${emails[i].subject}`
              timestamp.innerHTML = `${emails[i].timestamp}`

              sender.style.float="left";
              sender.style.fontWeight="bold";
              subject.style.float="center";
              timestamp.style.float="right";
              
              box.appendChild(sender);
              box.appendChild(subject);
              box.appendChild(timestamp);

              row.appendChild(box);
              row.appendChild(archive);
              document.querySelector('#emails-view').appendChild(row);

              box.onclick = () => {

                fetch(`/emails/${box.id}`)
                .then(response => response.json())
                .then(email => {

                  //mark email as read once it opened clicked on the inbox page
                  fetch(`/emails/${box.id}`, {
                    method: 'PUT',
                    body: JSON.stringify({
                        read: true
                    })
                  });

                  console.log(email);

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

              archive.onclick = () => {
                //mark email as archived once it's archived button is clicked
                fetch(`/emails/${box.id}`, {
                  method: 'PUT',
                  body: JSON.stringify({
                      archived: false
                  })
                });

                setTimeout(function() {
                  load_mailbox('archive');
                }, 100);
        
              }
            }
          }
      });

    }
}