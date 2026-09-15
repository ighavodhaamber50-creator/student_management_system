from django.urls import path
from .views import (
    create_student,
    get_students,
    get_student,
    update_student,
    delete_student,
)

urlpatterns = [
    path('create/', create_student),
    path('', get_students),
    path('<int:id>/', get_student),
    path('<int:id>/update/', update_student),
    path('<int:id>/delete/', delete_student),
]