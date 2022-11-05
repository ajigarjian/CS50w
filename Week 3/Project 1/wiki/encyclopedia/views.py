from django.shortcuts import render
import markdown2

from . import util


def index(request):
    return render(request, "encyclopedia/index.html", {
        "entries": util.list_entries()
    })

def page(request, page):
    if page.lower() == "css" or page.lower() == "html":
            page = page.upper()
    else:
        page = page.capitalize()

    file_name = util.get_entry(page)

    if file_name == None:
        return render(request, "encyclopedia/error.html")
    
    else:
        return render(request, "encyclopedia/page.html", {
            "page": page,
            "content": markdown2.markdown(file_name)
        })

