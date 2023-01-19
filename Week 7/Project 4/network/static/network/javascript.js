document.addEventListener('DOMContentLoaded', function() {

    document.querySelector('body').onclick = () => display_posts();

    document.querySelector('#new_post_form').onsubmit = () => publish_post();

    // function that runs whenever post submission button is clicked.
    function publish_post() {
        
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

        //End function so it stays in the same url
        event.preventDefault();

    }

    // Post that runs every time the page is loaded and when a new post is submitted
    function display_posts() {
        fetch(`/posts`)
        .then(response => response.json())
        .then(posts => {
            console.log(posts);
        })
    }
})



