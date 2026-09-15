from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status

from .models import Student
from .serializers import StudentSerializer


@api_view(['POST'])
def create_student(request):
    serializer = StudentSerializer(data=request.data)

    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



@api_view(['GET'])
def get_students(request):
    students = Student.objects.all()
    serializer = StudentSerializer(students, many=True)

    return Response(serializer.data, status=status.HTTP_200_OK)



@api_view(['GET'])
def get_student(request, id):
    try:
        student = Student.objects.get(id=id)
    except Student.DoesNotExist:
        return Response(
            {"message": "Student not found"},
            status=status.HTTP_404_NOT_FOUND
        )

    serializer = StudentSerializer(student)

    return Response(serializer.data, status=status.HTTP_200_OK)




@api_view(['PUT'])
def update_student(request, id):
    try:
        student = Student.objects.get(id=id)
    except Student.DoesNotExist:
        return Response(
            {"message": "Student not found"},
            status=status.HTTP_404_NOT_FOUND
        )

    serializer = StudentSerializer(student, data=request.data)

    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)




@api_view(['DELETE'])
def delete_student(request, id):
    try:
        student = Student.objects.get(id=id)
    except Student.DoesNotExist:
        return Response(
            {"message": "Student not found"},
            status=status.HTTP_404_NOT_FOUND
        )

    student.delete()

    return Response(
        {"message": "Student deleted successfully"},
        status=status.HTTP_204_NO_CONTENT
    )