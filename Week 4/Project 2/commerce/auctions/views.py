from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse
from django import forms
from django.core.exceptions import ValidationError
from django.contrib.auth.decorators import login_required

from .models import User, Listing, Bid, Comment, Watchlist

CATEGORIES = [
    ('', 'Select A Category'),
    ('Toys', 'Toys'),
    ('Fashion', 'Fashion'),
    ('Electronics', 'Electronics'),
    ('Home', 'Home'),
]

# Django Forms

class NewListingForm(forms.Form):
    title = forms.CharField()
    description = forms.CharField(widget=forms.Textarea)
    price = forms.CharField(widget=forms.NumberInput)
    image = forms.URLField(required=False)
    category = forms.CharField(label="Listing Category", widget=forms.Select(choices=CATEGORIES), required=False)

class NewBidForm(forms.Form):
    bid = forms.CharField(widget=forms.NumberInput, label="Bid")

class NewCommentForm(forms.Form):
    comment = forms.CharField(label="Add Comment")

class WatchlistForm(forms.Form):
    toggle = forms.BooleanField(required=False, label="Toggle Watchlist")

# Views

def index(request):
    return render(request, "auctions/index.html", {
        "active_listings": Listing.objects.filter(active=True),
        "closed_listings": Listing.objects.filter(active=False)

    })

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
            return render(request, "auctions/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "auctions/login.html")

@login_required
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
            return render(request, "auctions/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "auctions/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "auctions/register.html")

@login_required
def create(request):

    #if user is accessing create view after submitting a form:
    if request.method == "POST":

        #retrieve the form's info from the POST request
        form = NewListingForm(request.POST)

        #validate the form
        if form.is_valid():

            listing = Listing(title = form.cleaned_data["title"], 
            description = form.cleaned_data["description"], 
            price = form.cleaned_data["price"], 
            image = form.cleaned_data["image"], 
            category = form.cleaned_data["category"],
            owner = request.user
            )

            listing.save()

            return HttpResponseRedirect(reverse("index"))

        else:

            # If the form is invalid, re-render the page with existing information.
            return render(request, "auctions/create.html", {
                "form": form
            })

    return render(request, "auctions/create.html", {
        "form": NewListingForm()
    })

def listing(request, id):

    # get the listing object associated with the listing view we are on
    listing = Listing.objects.get(id=id)

    # actions performed returning to listing page after bid submitted via POST:
    if request.method == "POST":

        if 'commentSubmit' in request.POST:

            form = NewCommentForm(request.POST)

            if form.is_valid():

                comment_text = form.cleaned_data["comment"]
                comment = Comment(listing = listing, user = request.user, comment = comment_text)
                comment.save()

        elif 'closeSubmit' in request.POST:

            listing.active = False
            listing.save()
        
        elif 'watchlistToggle' in request.POST:

            form = WatchlistForm(request.POST)

            if not Watchlist.objects.filter(listing = listing, user = request.user):
                watchlist_record = Watchlist(listing = listing, user = request.user)
                watchlist_record.save()
                        
            elif Watchlist.objects.filter(listing = listing, user = request.user):
                Watchlist.objects.filter(listing = listing, user = request.user).first().delete()

        elif 'bidSubmit' in request.POST:

            # retrieve form information for bid
            form = NewBidForm(request.POST)

            # actions performed if form is valid
            if form.is_valid():

                bid_number = int(form.cleaned_data["bid"])

                # actions performed if bid is higher than listing current price
                if bid_number > listing.price:

                    # If current winning bid, create and save a new Bid object with the current listing object linked as a foreign key, the bid amount, and the user making the bid
                    bid = Bid(listing = listing, bid = bid_number, user=request.user)
                    bid.save()
                    
                    # Furthermore, update listing price to be new highest bid and save it
                    listing.price = bid_number
                    listing.save()
        
        return HttpResponseRedirect(reverse("listing", args=(listing.id,)))
    
    return render(request, "auctions/listing.html", {
        "id": id,
        "listing": listing,
        "form": NewBidForm(),
        "comment_form": NewCommentForm(),
        "watchlist_form": WatchlistForm(),
        "watchlist_record": Watchlist.objects.filter(listing = listing, user = request.user).first(),
        "listing_bids": Bid.objects.filter(listing = listing),
        "listing_comments": Comment.objects.filter(listing = listing),
        "user": request.user
    })

def category(request, category=None):

    listings = Listing.objects.none()

    if category != None:
        listings = Listing.objects.filter(category = category, active = True)

    return render(request, "auctions/categories.html", {
        "categories": CATEGORIES,
        "category": category,
        "listings": listings
    })

@login_required
def watchlist(request):
    watchlist = Watchlist.objects.filter(user = request.user)

    return render(request, "auctions/watchlist.html", {
        "watchlist": watchlist
    })