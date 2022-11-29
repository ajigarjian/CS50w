from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    pass

class Listing(models.Model):
    title = models.CharField(max_length=64)
    description = models.CharField(max_length=255)
    price = models.IntegerField()
    image = models.URLField(max_length=200, blank=True)
    category = models.CharField(max_length=255, blank=True)
    owner = models.ForeignKey(User, default="", on_delete=models.CASCADE, related_name="listingOwner", blank=False)
    active = models.BooleanField(default="True")

class Bid(models.Model):
    listing = models.ForeignKey(Listing, default="", on_delete=models.CASCADE, related_name="auctionItem")
    user = models.ForeignKey(User, default="", on_delete=models.CASCADE, related_name="biddingUser")
    bid = models.IntegerField()

class Comment(models.Model):
    listing = models.ForeignKey(Listing, default="", on_delete=models.CASCADE, related_name="commentItem")
    user = models.ForeignKey(User, default="", on_delete=models.CASCADE, related_name="commentingUser")
    comment = models.CharField(max_length=255)

class Watchlist(models.Model):
    listing = models.ForeignKey(Listing, default="", on_delete=models.CASCADE, related_name="watchlistListing")
    user = models.ForeignKey(User, default="", on_delete=models.CASCADE, related_name="watchlistUser")