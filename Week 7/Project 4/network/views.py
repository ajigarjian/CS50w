import json
from datetime import datetime
from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import JsonResponse
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from django.core.paginator import Paginator

from .models import User, Post
 

def index(request):
    return render(request, "network/index.html")

@csrf_exempt
@login_required
def publish(request):
    # Publishing a new post must be via POST, otherwise send error back to js file
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)
    
    #Get post content from POST
    data = json.loads(request.body)
    content = data.get("content")

    # Return error if the post content is empty (user didn't enter any text)
    if content == "":
        return JsonResponse({"error": "Post must not be empty."}, status=400)


    #Create post
    post = Post(
        content=content,
        author=request.user
    )

    #Save post to database
    post.save()

    # Once saved to database, return success message
    return JsonResponse({"message": "Post published successfully."}, status=201)

@csrf_exempt
@login_required
def update(request, post_id):
    # Publishing a new post must be via POST, otherwise send error back to js file
    if request.method != "PUT":
        return JsonResponse({"error": "PUT request required."}, status=400)

    # Query for requested post
    try:
        post = Post.objects.get(author=request.user, pk=post_id)
    except Post.DoesNotExist:
        return JsonResponse({"error": "Post not found."}, status=404)
    
    #Get post content from PUT
    data = json.loads(request.body)
    content = data.get("content")

    # Return error if the post content is empty (user deleted old text and didn't enter any new test)
    if content == "":
        return JsonResponse({"error": "New text must not be empty."}, status=400)

    #Update post with new content and current time of update
    post.content = content
    post.timestamp = datetime.now()
    
    # Also update post to reflect that it has been edited if it hasn't been so already
    if post.edited != True:
         post.edited = True

    post.save()
    
    # Once saved to database, return success message
    return JsonResponse({"message": "Post updated successfully."}, status=201)

@csrf_exempt
@login_required
def posts(request, page):
    if request.method == "GET":
        all_posts = Paginator(Post.objects.order_by('-timestamp'), 10)
        current_posts = [post.serialize() for post in all_posts.page(page)]

        user = request.user.username
        
        return JsonResponse({"posts_key": current_posts, "user_key": user, "page_range" : list(Paginator(Post.objects.order_by('-timestamp'), 10).page_range)}, safe=False)
    
    else:
        return JsonResponse({"error": "GET request required."}, status=400)

def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")

@csrf_exempt
@login_required
def page(request, post_id):
    page_number = (list(Post.objects.order_by('-timestamp').values_list('id', flat=True)).index(post_id)+10)//10

    return JsonResponse(page_number, safe=False)

