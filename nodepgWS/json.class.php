<?php if (!defined('BASEPATH')) exit('No direct script access allowed');
 class Json{
	public function encode($dados){ 
		echo json_encode($dados, JSON_UNESCAPED_UNICODE); //128 = JSON_PRETTY_PRINT
	}
}
