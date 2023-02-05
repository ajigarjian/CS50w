from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    posts = models.ForeignKey("Post", on_delete=models.CASCADE, null=True)
    # comments = models.ForeignKey("Comment", on_delete=models.CASCADE, null=True)
    followers = models.ManyToManyField('self', related_name="following", symmetrical=False, null=True)

class Post(models.Model):
    content = models.TextField(max_length = 255, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    author = models.ForeignKey("User", on_delete=models.CASCADE)
    edited = models.BooleanField(default=False)
    # comments = models.ForeignKey("Comment", on_delete=models.CASCADE)

    def serialize(self):
        return {
            "id": self.id,
            "content": self.content,
            "timestamp": self.timestamp.strftime("%b %d %Y, %I:%M %p"),
            "author": self.author.username,
            "edited": self.edited
        }

# class Comment(models.Model):
#     text = models.TextField(max_length = 255, null=True)
#     timestamp = models.DateTimeField(auto_now_add=True)
#     author = models.ForeignKey("User", on_delete=models.CASCADE)
#     parent_post = models.ForeignKey("Post", on_delete=models.CASCADE)

