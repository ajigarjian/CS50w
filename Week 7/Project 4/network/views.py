import json
from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import JsonResponse
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required

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
def posts(request):
    if request.method == "GET":
        return JsonResponse([post.serialize() for post in reversed(Post.objects.all())], safe=False)
    
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
