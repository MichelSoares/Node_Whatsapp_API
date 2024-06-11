<?php define('BASEPATH', dirname(__FILE__));

header('Content-Type: text/plain; charset=UTF-8');
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Cache-Control: post-check=0, pre-check=0", false);
header("Pragma: no-cache");
header('Content-Type: application/json');
error_reporting(E_ERROR | E_WARNING | E_PARSE | E_NOTICE);


require_once 'consulta.class.php';

if($_SERVER['REQUEST_METHOD'] == 'POST' && $_SERVER['HTTP_USER_AGENT'] == 'NODEPG'){
	$token = "";
	if (isset($_POST["token"]))
	{
		$token = urldecode($_POST["token"]);
	}
	if ($token == "")
	{
		if (isset($_GET["token"]))
		{$token = $_GET['token'];}
	}
	if($token == "2s7vrl2o0m0hq9xaf2vsu4vay638hfye"){ //token filho único kkk

		if(isset($_GET['get_session_is_auth'])){
     		$numero = urldecode($_GET['numero']);
     		$consulta = new Consulta;
		    $consulta->get_session_is_auth($numero);
    } 
    else if(isset($_GET['get_number_exists'])){
        $numero = urldecode($_GET['numero']);
     		$consulta = new Consulta;
		    $consulta->get_number_exists($numero);
    }
    else if(isset($_GET['get_last_uptime_qrcode'])){
        $numero = urldecode($_GET['numero']);
     		$consulta = new Consulta;
		    $consulta->get_last_uptime_qrcode($numero);
    }
    else if(isset($_GET['get_accountsid'])){
        $numero = urldecode($_GET['numero']);
     		$consulta = new Consulta;
		    $consulta->get_accountsid($numero);
    } 
    else if(isset($_GET['get_cost_msg_session'])){
     		$consulta = new Consulta;
		    $consulta->get_cost_msg_session();
    }   
    else if(isset($_GET['put_reset_session'])){
        $numero = urldecode($_GET['numero']);
     		$consulta = new Consulta;
		    $consulta->put_reset_session($numero);
    }
    else if(isset($_GET['put_new_qrcode'])){
        $numero = urldecode($_GET['numero']);
     		$consulta = new Consulta;
		    $consulta->put_new_qrcode($numero);
    }
    else if(isset($_GET['put_set_new_session'])){
        $id_new_session = urldecode($_GET['id_new_session']);
        $numero = urldecode($_GET['numero']);
     		$consulta = new Consulta;
		    $consulta->put_set_new_session($id_new_session,$numero);
    }
    /*else if(isset($_GET['put_set_new_qrcode'])){
        $qrcode_b64 = urldecode($_GET['qrcode_b64']);
        $porta = urldecode($_GET['porta']);
        $numero = urldecode($_GET['numero']);
     		$consulta = new Consulta;
		    $consulta->put_set_new_qrcode($qrcode_b64,$porta,$numero);
    }*/
    else if(isset($_GET['put_reset_qrcode'])){
        $numero = urldecode($_GET['numero']);
     		$consulta = new Consulta;
		    $consulta->put_reset_qrcode($numero);
    }
    else if(isset($_GET['put_set_auth'])){
        $numero = urldecode($_GET['numero']);
     		$consulta = new Consulta;
		    $consulta->put_set_auth($numero);
    }
    else if(isset($_GET['put_set_status_outbound'])){
        $statusmsg = urldecode($_GET['statusmsg']);
        $uuid = urldecode($_GET['uuid']);
     		$consulta = new Consulta;
		    $consulta->put_set_status_outbound($statusmsg,$uuid);
    }
    else if(isset($_GET['put_group_update'])){
        $nome = urldecode($_GET['nome']);
        $group_id = urldecode($_GET['group_id']);
        $numero = urldecode($_GET['numero']);
     		$consulta = new Consulta;
		    $consulta->put_group_update($nome,$group_id,$numero);
    }
    
    else if(isset($_GET['put_status_outbound'])){
        $idmsg = urldecode($_GET['idmsg']);
        $smsmessagesid = isset($_GET['smsmessagesid']) ? urldecode($_GET['smsmessagesid']) : null;
        $accountsid = isset($_GET['accountsid']) ? urldecode($_GET['accountsid']) : null;
        $smsstatus = urldecode($_GET['smsstatus']);
     		$consulta = new Consulta;
		    $consulta->put_status_outbound($idmsg,$smsmessagesid,$accountsid,$smsstatus);
    }
    
    else if(isset($_GET['put_outbound_fail'])){
        $idmsg = urldecode($_GET['idmsg']);
        $smsmessagesid = urldecode($_GET['smsmessagesid']);
        $accountsid = urldecode($_GET['accountsid']);
     		$consulta = new Consulta;
		    $consulta->put_outbound_fail($idmsg,$smsmessagesid,$accountsid);
    }
    
    else if(isset($_GET['del_group_leave'])){
        $group_id = urldecode($_GET['group_id']);
        $numero = urldecode($_GET['numero']);
     		$consulta = new Consulta;
		    $consulta->del_group_leave($group_id,$numero);
    }
    else if(isset($_GET['ins_group_join'])){
        $group_id = urldecode($_GET['group_id']);
        $nome = urldecode($_GET['nome']);
        $numero = urldecode($_GET['numero']);
     		$consulta = new Consulta;
		    $consulta->ins_group_join($group_id,$nome,$numero);
    }    
    else if(isset($_GET['ins_msg_inbound_group'])){
        $mediacontenttype = urldecode($_GET['mediacontenttype']);
        $smsmessagesid = urldecode($_GET['smsmessagesid']);
        $nummedia = urldecode($_GET['nummedia']);
        $smssid = urldecode($_GET['smssid']);
        $body = urldecode($_GET['body']);
        $src = urldecode($_GET['src']);
        $accountsid = urldecode($_GET['accountsid']);
        $dst = urldecode($_GET['dst']);
        $mediaurl = urldecode($_GET['mediaurl']);
        $date = urldecode($_GET['date']);
        $cost_cli = urldecode($_GET['cost_cli']);
        $latitude = urldecode($_GET['latitude']);
        $longitude = urldecode($_GET['longitude']);
        $profilename = urldecode($_GET['profilename']);
        $notifyname = urldecode($_GET['notifyname']);
        $author = urldecode($_GET['author']);
        $isforwarded = urldecode($_GET['isforwarded']);
        $forwardingscore = urldecode($_GET['forwardingscore']);
     		$consulta = new Consulta;
		    $consulta->ins_msg_inbound_group($mediacontenttype,$smsmessagesid,$nummedia,$smssid,$body,$src,$accountsid,$dst,$mediaurl,$date,$cost_cli,$latitude,$longitude,$profilename,$notifyname,$author,$isforwarded,$forwardingscore);
    }
    
    else if(isset($_GET['ins_msg_inbound'])){
        $mediacontenttype = urldecode($_GET['mediacontenttype']);
        $smsmessagesid = urldecode($_GET['smsmessagesid']);
        $nummedia = urldecode($_GET['nummedia']);
        $smssid = urldecode($_GET['smssid']);
        $body = urldecode($_GET['body']);
        $src = urldecode($_GET['src']);
        $accountsid = urldecode($_GET['accountsid']);
        $dst = urldecode($_GET['dst']);
        $mediaurl = urldecode($_GET['mediaurl']);
        $date = urldecode($_GET['date']);
        $cost_cli = urldecode($_GET['cost_cli']);
        $latitude = urldecode($_GET['latitude']);
        $longitude = urldecode($_GET['longitude']);
        $profilename = urldecode($_GET['profilename']);
        $isforwarded = urldecode($_GET['isforwarded']);
        $forwardingscore = urldecode($_GET['forwardingscore']);
     		$consulta = new Consulta;
		    $consulta->ins_msg_inbound($mediacontenttype,$smsmessagesid,$nummedia,$smssid,$body,$src,$accountsid,$dst,$mediaurl,$date,$cost_cli,$latitude,$longitude,$profilename,$isforwarded,$forwardingscore);
    }
    
		else
		{
			if(isset($_GET['count'])){
				$count = $_GET['count'];}
			else{
				$count = 3;}


			if(isset($_GET['orderby'])){
				$orderby = $_GET['orderby'];}
			else{
				$orderby = 'id';}


			if(isset($_GET['direct'])){
				$direct = strtoupper($_GET['direct']);
			}
			else{
				$direct = 'DESC';
			}


			unset($_GET['limit']);
			unset($_GET['orderby']);
			unset($_GET['direct']);

		}
	}
	else
	{
		exit('{"error":"Acesso bloqueado"}');
	}
}
else
{
	exit('{"logged":false}');

}

