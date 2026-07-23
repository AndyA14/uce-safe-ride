Feature: Autenticación en UCE Safe Ride

  Scenario: Iniciar sesión exitosamente
    Given estoy en la página de inicio de sesión de Safe Ride
    When ingreso mi correo "laaucancela@uce.edu.ec" y contraseña "123456"
    And hago clic en el botón de ingresar
    Then deberia ser redirigido al dashboard principal