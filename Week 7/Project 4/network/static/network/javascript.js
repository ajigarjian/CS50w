document.addEventListener('DOMContentLoaded', function() {

    // Call helper function upon loading page to load in posts
    display_posts();

    // Events that occur if a new post is submitted
    document.querySelector('#new_post_form').onsubmit = () => {

        // get the text value of the textarea
        const content_field = document.querySelector('#post-content');
        const content = content_field.value;

        //perform an API call to asynchronously pass the data to the posts url (and then publish view) where it will be saved to the database
        fetch('/publish', {
            method: 'POST',
            body: JSON.stringify({
                content: content
          })
        })

        // Receive response from server side to know if post was successfully added to database or not
        .then(response => response.json())
        .then(result => {   
            console.log(result);
        });

        // Reset the form textarea to be blank
        content_field.value = '';

        // Update post html content with new post
        setTimeout(function() { 
            display_posts();
          }, 10);

        // Stop form from submitting
        return false;
    }

    function edit_save_post() {

         // Traverse up DOM from edit field to edit container to post container
         post_container = this.parentElement.parentElement;

        // If the user clicked on the edit_save field and it read "edit", then modify the structure of the post to textarea for editing
        if (this.innerHTML == "Edit") {

            // Traverse down the DOM from post container to content container to store content field text (AKA post text)
            post_text = post_container.firstElementChild.firstElementChild.innerHTML;

            // For the next 10 lines, we get rid of the existing content field and replace it with a textarea.
            // Create a new textarea element, give it the appropriate CSS via form-control class, and prepopulate it with the post text we just stored
            edit_text_field = document.createElement('textarea');
            edit_text_field.setAttribute('class', 'form-control');
            edit_text_field.innerHTML = post_text;

            // Remove the post content container, change "Edit" button to "Save", and add the textarea in
            post_container.firstElementChild.remove();

            post_container.firstElementChild.firstElementChild.innerHTML = "Save";

            post_container.insertBefore(edit_text_field, post_container.firstElementChild);
        
        }
                
        // Otherwise, if it read "save", perform the logic to save the post on the backend and refresh the html content
        else if (this.innerHTML == "Save") {
            
            //get the string content of the textarea element now that the user has modified the post text
            new_post_text = post_container.firstElementChild.value;

            //fetch a PUT request with new content
            fetch(`/update/${post_container.id}`, {
                method: 'PUT',
                body: JSON.stringify({
                    content : new_post_text
                })
              })

            // Record response sent from backend to verify if successfully updated
            .then(response => response.json())
            .then(result => {   
                console.log(result);
            });
            
            // Once the post is async updated via API call to backend, call display posts so the html is reset w/ the new content
            setTimeout(function() { 
                display_posts();
            }, 100);
        };

        return false;
    }

    // Function that displays all posts by manipulating the DOM
    function display_posts() {

        // Reset posts so there's nothing in there before adding all of them back in plus the new one
        document.querySelector('#posts_container').innerHTML = '';

        fetch(`/posts`)
        .then(response => response.json())
        .then(data => {
            data["posts_key"].forEach(post => create_post_html(post, data["user_key"])); 
        })
        return;
    }

    function create_post_html(post, current_user) {

        // 1. create a container div and append that div to the overall DOM
        const post_container = document.createElement('div');
        post_container.setAttribute('class', 'post_box');
        post_container.setAttribute('id', `${post.id}`);
        document.querySelector('#posts_container').appendChild(post_container);

    
        // 2. Create divs - one for content, one for edit link, one for username, one for time, one for likes, & put those divs within the container div
        const content_container = document.createElement('div');
        const edit_container = document.createElement('div');
        const author_container = document.createElement('div');
        const time_container = document.createElement('div');
        const like_container = document.createElement('div');

        post_container.appendChild(content_container);
        post_container.appendChild(edit_container);
        post_container.appendChild(author_container);
        post_container.appendChild(time_container);
        post_container.appendChild(like_container);

        // 3. Populate each div with the required content (either posts provided from the API call or just dummy info during testing)

        const post_content = document.createElement('h4');
        const edit_content = document.createElement('text');
        const author_content = document.createElement('text');
        const time_content = document.createElement('text');
        const like_content = document.createElement('text');

        time_content.setAttribute("class", "timestamp_field");
        edit_content.setAttribute("class", "edit_field");

        edit_content.addEventListener("click", edit_save_post);
        
        post_content.innerHTML = post.content;
        edit_content.innerHTML = `Edit`;
        author_content.innerHTML = post.author;
        time_content.innerHTML = `${post.timestamp}`;

       if (post.edited == true) {
            time_content.innerHTML += ` (Edited)`;
        }

        like_content.innerHTML = `Like`;

        content_container.appendChild(post_content);

        if (post.author == current_user) {
            edit_container.appendChild(edit_content);
        }
        author_container.appendChild(author_content);
        time_container.appendChild(time_content);
        like_container.appendChild(like_content);

        return;
    }
})



