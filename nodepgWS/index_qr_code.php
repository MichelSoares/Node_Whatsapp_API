<?php 
define('BASEPATH', dirname(__FILE__));
header('Content-Type: application/json; charset=UTF-8');
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Cache-Control: post-check=0, pre-check=0", false);
header("Pragma: no-cache");
error_reporting(E_ERROR | E_WARNING | E_PARSE | E_NOTICE);

require_once 'consulta.class.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if ($_SERVER['HTTP_USER_AGENT'] === 'NODEPG') {
        if (isset($_SERVER['HTTP_TOKEN']) && $_SERVER['HTTP_TOKEN'] === '2s7vrl2o0m0hq9xaf2vsu4vay638hfye') {
            
            $requestData = json_decode(file_get_contents('php://input'), true);
            
            if ($requestData !== null) {
                $consulta = new Consulta();

                $response = $consulta->put_set_new_qrcode($requestData); 
                
                echo json_encode($response);
                
            } else {
                http_response_code(400);
                echo json_encode(array('error' => 'Invalid request data'));
            }           
        } else {
            http_response_code(403);
            echo json_encode(array('error' => 'Access denied'));
        }
        
    } else {
        http_response_code(403);
        echo json_encode(array('error' => 'Access denied'));
    }
    
} else {
    http_response_code(405);
    echo json_encode(array('error' => 'Method Not Allowed'));
}
?>
