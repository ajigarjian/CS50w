document.addEventListener('DOMContentLoaded', function() {

    // Call helper function upon loading page to show posts
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
          }, 100);

        // Stop form from submitting
        return false;
    }


    // Function that displays all posts by manipulating the DOM
    function display_posts() {

        // Reset posts so there's nothing in there before adding all of them back in plus the new one
        document.querySelector('#posts_container').innerHTML = '';

        fetch(`/posts`)
        .then(response => response.json())
        .then(posts => {
            posts.forEach(post => create_post_html(post));
        })

        return;
    }


    function create_post_html(post) {

        // 1. create a container div and append that div to the overall DOM
        const post_container = document.createElement('div');
        post_container.setAttribute('class', 'post_box');
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
        
        post_content.innerHTML = post.content;
        edit_content.innerHTML = `Edit`;
        author_content.innerHTML = post.author;
        time_content.innerHTML = post.timestamp;
        like_content.innerHTML = `Like`;

        content_container.appendChild(post_content);
        edit_container.appendChild(edit_content);
        author_container.appendChild(author_content);
        time_container.appendChild(time_content);
        like_container.appendChild(like_content);

        return;
    }
})



