<?php
// contacto.php (con diagnóstico y requires dentro de POST)

// MODO DIAGNÓSTICO TEMPORAL: manda errores a error_log del servidor
ini_set('log_errors', '1');
ini_set('display_errors', '0'); // no mostrar en pantalla (mejor solo en logs)
error_reporting(E_ALL);

// Cargar configuración
$configPath = __DIR__ . '/config.php';
if (!is_file($configPath)) {
  error_log('[contacto.php] No se encontró config.php en ' . $configPath);
  http_response_code(500);
  exit('Config ausente');
}
$config = require $configPath;

// Helpers
function clean($v) { return trim(filter_var($v ?? '', FILTER_SANITIZE_STRING)); }
function respond($ok, $msg, $http=200) {
  http_response_code($http);
  $isAjax = isset($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest';
  if ($isAjax) {
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['ok'=>$ok, 'message'=>$msg], JSON_UNESCAPED_UNICODE);
  } else {
    // feedback simple si se accede directo
    echo "<script>alert('".addslashes($msg)."');window.history.back();</script>";
  }
  exit;
}

// Si es GET, mostrar healthcheck (para evitar “página en blanco”)
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  echo 'Método no permitido (healthcheck ok)';
  exit;
}

// Honeypot
if (!empty($_POST['empresa'])) {
  respond(true, 'OK');
}

// Validación básica
$nombre   = clean($_POST['nombre']   ?? '');
$email    = clean($_POST['email']    ?? '');
$telefono = clean($_POST['telefono'] ?? '');
$mensaje  = trim($_POST['mensaje']   ?? '');

if (!$nombre || !filter_var($email, FILTER_VALIDATE_EMAIL) || !$mensaje) {
  respond(false, 'Por favor completa nombre, email y mensaje.', 400);
}

// Cuerpo correo
$bodyHtml = "
  <h2>Nuevo contacto desde el sitio web</h2>
  <p><b>Nombre:</b> ".htmlentities($nombre)."</p>
  <p><b>Email:</b> ".htmlentities($email)."</p>
  <p><b>Teléfono:</b> ".htmlentities($telefono)."</p>
  <p><b>Mensaje:</b><br>".nl2br(htmlentities($mensaje))."</p>
";
$bodyText = "Nuevo contacto desde el sitio web\n"
          . "Nombre: $nombre\n"
          . "Email: $email\n"
          . "Teléfono: $telefono\n\n"
          . "Mensaje:\n$mensaje\n";

// ==== CARGAR PHPMailer SOLO AQUÍ (tras validar POST) ====
$phpmailerBase = __DIR__ . '/vendor/phpmailer/src';
if (!is_file($phpmailerBase . '/PHPMailer.php') || !is_file($phpmailerBase . '/SMTP.php') || !is_file($phpmailerBase . '/Exception.php')) {
  error_log('[contacto.php] No se encuentran archivos de PHPMailer en ' . $phpmailerBase);
  respond(false, 'Error interno: dependencias faltantes.', 500);
}
require $phpmailerBase . '/PHPMailer.php';
require $phpmailerBase . '/SMTP.php';
require $phpmailerBase . '/Exception.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// Enviar
$mail = new PHPMailer(true);

// DEBUG SMTP (temporal para diagnóstico: revisa en cPanel → Metrics → Errors)
$mail->SMTPDebug  = 2;
$mail->Debugoutput = 'error_log';

try {
  $mail->isSMTP();
  $mail->Host       = $config['smtp_host'];
  $mail->SMTPAuth   = true;
  $mail->Username   = $config['smtp_user'];
  $mail->Password   = $config['smtp_pass'];

  if ((int)$config['smtp_port'] === 465) {
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS; // SSL
  } else {
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS; // TLS (587)
  }
  $mail->Port = (int)$config['smtp_port'];

  $mail->setFrom($config['from_email'], $config['from_name']);
  $mail->addAddress($config['to_email']);
  if (!empty($config['bcc_email'])) {
    $mail->addBCC($config['bcc_email']); // tu Gmail para probar salida
  }
  $mail->addReplyTo($email, $nombre);

  $mail->isHTML(true);
  $mail->Subject = 'Nuevo contacto desde el sitio web';
  $mail->Body    = $bodyHtml;
  $mail->AltBody = $bodyText;

  $mail->send();
  respond(true, '¡Gracias! Tu mensaje fue enviado correctamente.');
} catch (Exception $e) {
  error_log('[contacto.php] Mailer Error: ' . $mail->ErrorInfo);
  respond(false, 'Lo sentimos, no pudimos enviar tu mensaje. Intenta más tarde.', 500);
}
