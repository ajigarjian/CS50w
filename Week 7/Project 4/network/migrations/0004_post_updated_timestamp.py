# Generated by Django 4.1.4 on 2023-02-05 19:22

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('network', '0003_remove_post_comments_remove_user_comments_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='post',
            name='updated_timestamp',
            field=models.DateTimeField(auto_now=True),
        ),
    ]
