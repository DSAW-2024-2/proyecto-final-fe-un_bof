Nombres: Andrés Mauricio Ricaurte y David Santiago Medina  
Link al front end: https://drive2u.vercel.app

# Proyecto de Creación y Gestión de Viajes de Wheels (frontend)

## Descripción del Proyecto

Esta parte del proyecto consiste en la creación del frontend para una aplicación web de Wheels que le permita a los usuarios gestionar sus viajes. Permite a los usuarios crear una cuenta seleccionando su tipo de usuario (pasajero o conductor) y proporcionando información personal y, en el caso de los conductores, detalles sobre su vehículo. La aplicación utiliza un formulario de registro dividido en pasos, lo que mejora la experiencia del usuario al guiarlo a través del proceso de registro. La información se envía a un servidor a través de una solicitud HTTP utilizando Axios, y se manejan los errores con notificaciones visuales mediante la biblioteca React Toastify.

## Funciones Utilizadas
- useState: Este hook se utiliza para manejar el estado de los datos del formulario y el estado de carga de la aplicación. Permite almacenar y actualizar la información del usuario a medida que completa el formulario.  
- useNavigate: Este hook de React Router se utiliza para la navegación programática. Permite redirigir al usuario a diferentes rutas de la aplicación después de completar el registro.  
- handleChange: Esta función maneja los cambios en los campos del formulario. Actualiza el estado del formulario según el valor ingresado por el usuario o el archivo seleccionado.  
- handleUser TypeSelect: Esta función se utiliza para establecer el tipo de usuario (pasajero o conductor) seleccionado por el usuario.  
- nextStep y prevStep: Estas funciones permiten al usuario navegar entre los diferentes pasos del formulario de registro, incrementando o decrementando el estado currentStep.  
- handleSubmit: Esta función se encarga de manejar el envío del formulario. Crea un objeto FormData para enviar los datos del formulario, incluidos los archivos, a la API del servidor. También maneja las respuestas y errores de la solicitud, mostrando mensajes de éxito o error al usuario.  
- renderStep: Esta función renderiza el contenido del formulario basado en el paso actual. Cada paso muestra diferentes campos de entrada según el tipo de usuario y la información requerida.  
- ToastContainer y toast: Estas funciones de la biblioteca React Toastify se utilizan para mostrar notificaciones al usuario sobre el estado del registro, ya sea éxito o error.
