<?php 
if (!defined('BASEPATH')) exit('No direct script access allowed');
require_once('json.class.php');
$JSON = new JSON;

class Cache {
	private static $time = '5 seconds';
	private static $path = '/var/lib/php/session/';
	private $folder;

	public function __construct($folder = null) {
		$this->setFolder(!is_null($folder) ? $folder : sys_get_temp_dir());
	}
	protected function generateFileLocation($key) {
		return $this->folder . DIRECTORY_SEPARATOR . sha1($key) . '.tmp';
	}
	protected function createCacheFile($key, $content) {
		$filename = $this->generateFileLocation($key);
		return file_put_contents($filename, $content)
			OR trigger_error('Não foi possível criar o arquivo de cache', E_USER_ERROR);
	}
	public function save($key, $content, $time = null) {
		$time = strtotime(!is_null($time) ? $time : self::$time);

		$content = serialize(array(
			'expires' => $time,
			'content' => $content));

		return $this->createCacheFile($key, $content);
	}
	public function read($key) {
		$filename = $this->generateFileLocation($key);
		if (file_exists($filename) && is_readable($filename)) {
			$cache = unserialize(file_get_contents($filename));
			if ($cache['expires'] > time()) {
				return $cache['content'];
			} else {
				unlink($filename);
			}
		}
		return null;
	}
	protected function setFolder($folder) {
		if (file_exists($folder) && is_dir($folder) && is_writable($folder)) {
			$this->folder = $folder;
		} else {
			trigger_error('Não foi possível acessar a pasta de cache', E_USER_ERROR);
		}
	}

}

class  Consulta2 {
	protected $conexao1;
	const HOSTNAME = '127.0.0.1';
	const PORTA = '5432';
	const DB = 'whatsapp_DB_OC';
	const USUARIO = 'usuario';
	const SENHA = 'senhaqualquer';
	public function __construct(){
		$this->conectar1();
	}
	public function __destruct(){
		$this->desconectar1();
	}
	private function conectar1(){
		try {
			$opts     = array(
				PDO::ATTR_PERSISTENT         => true, // use existing connection if exists, otherwise try to connect
				PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC // by default fetch results as associative array
			);
			$this->conexao1 = new PDO('pgsql:host='. self::HOSTNAME .';
			port='. self::PORTA .';
			dbname='. self::DB .';',
				self::USUARIO,
				self::SENHA, $opts);
			#                       $this->conexao = new PDO('pgsql:dbname='. self::DB .';',
			#                                       self::USUARIO,
			#                                       self::SENHA, $opts);

		}
		catch(PDOException $e){
			echo $e->getMessage();
			exit();
		}
	}
	private function desconectar1(){
		//              $this->conexao = null;
	}
	public function sga_monit_agente_status_callpro1(){
		$cache = new Cache();
		$dados = $cache->read("sga_monit_agente_status_callpro");
		if (!$dados) {
			$sql = $this->conexao1->prepare("SELECT public.sga_monit_agente_status_callpro();");
			$sql->execute();
			for($i = 0; $i<$sql->rowCount(); $i++){
				$dados['Dados'][] = $sql->fetch(PDO::FETCH_ASSOC);
			}
			$e = $sql->errorinfo();
			$dados['Mensagem'] = array('SQL' => self::erro($e[1]), 'RESULT' => 'OK');
			$cache->save("sga_monit_agente_status_callpro", $dados, '18 seconds');
			$this->desconectar1();
		}
		echo JSON::encode($dados);
	}
	protected function erro($code){

		if ( $code == 0000):
			return 'Query executada com sucesso!';
endif;

if ($code == 1146):
	return 'Tabela não existe.';
endif;
if ($code == 99999):
	return 'Erro update.';
endif;


	}

}
class  Consulta {
	protected $conexao;
	const HOSTNAME = '127.0.0.1';
	const PORTA = '5432';
	const DB = 'whatsapp_DB_OC';
	const USUARIO = 'usuario';
	const SENHA = 'senhaqualquer';
	public function __construct(){
		$this->conectar();		
	}
	public function __destruct(){
		$this->desconectar();
	}
	private function conectar(){
		try {
			$opts     = array(
				PDO::ATTR_PERSISTENT         => true, // use existing connection if exists, otherwise try to connect
				PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC // by default fetch results as associative array
			);
			$this->conexao = new PDO('pgsql:host='. self::HOSTNAME .';
			port='. self::PORTA .';
			dbname='. self::DB .';', 
				self::USUARIO, 
				self::SENHA, $opts);
			#                       $this->conexao = new PDO('pgsql:dbname='. self::DB .';',
			#                                       self::USUARIO,
			#                                       self::SENHA, $opts);

		}
		catch(PDOException $e){
			echo $e->getMessage();
			exit();
		}				
	}
	private function desconectar(){
		//		$this->conexao = null;
	}

  public function get_session_is_auth($numero){
      //$sql = $this->conexao->prepare("SELECT COUNT(sender), client_id, is_authenticated FROM tb_smsaccount WHERE sender = '+$numero' and client_id is not null GROUP BY client_id, is_authenticated");
      $sql = $this->conexao->prepare("SELECT sender, client_id, is_authenticated FROM tb_smsaccount WHERE sender = '+$numero';");
      $sql->execute();
		  for($i = 0; $i<$sql->rowCount(); $i++){
			$dados['dados'][] = $sql->fetch(PDO::FETCH_ASSOC);
		  }

		  $e = $sql->errorinfo();
		  $dados['DATA'] = array('SQL' => self::erro($e[1]), 'RESULT' => ''.$sql->rowCount().'');


		  $this->desconectar();
		  echo JSON::encode($dados);
  }
  
  public function get_number_exists($numero){
    $sql = $this->conexao->prepare("SELECT COUNT(sender) FROM tb_smsaccount WHERE sender = '+$numero'");
    $sql->execute();
    echo $sql->fetchColumn();
    $this->desconectar();
  }
  
  public function get_last_uptime_qrcode($numero){
    $sql = $this->conexao->prepare("SELECT COUNT(last_update) FROM tb_smsaccount WHERE sender = '+$numero' AND (now() - last_update) < interval '1 minutes'");
    $sql->execute();
    echo $sql->fetchColumn();
    $this->desconectar();
  }
  
  public function get_accountsid($numero){
    $sql = $this->conexao->prepare("SELECT accountsid FROM tb_smsaccount WHERE sender = '+$numero'");
    $sql->execute();
    echo $sql->fetchColumn();
    $this->desconectar();
  }
  
  public function get_cost_msg_session(){
    $sql = $this->conexao->prepare("SELECT custo_msg_whatsapp_session FROM public.tb_custo_agecom WHERE now() >= dt_ini AND now() <= dt_fim;");
    $sql->execute();
    echo $sql->fetchColumn();
    $this->desconectar();
  }
  
  public function put_reset_session($numero){
    $sql = $this->conexao->prepare("UPDATE tb_smsaccount SET qr_code_b64 = null, is_authenticated = false, client_id = null WHERE broker = 'Agecom' AND sender = '+$numero'");
    $sql->execute();
		  for($i = 0; $i<$sql->rowCount(); $i++){
			$dados['dados'][] = $sql->fetch(PDO::FETCH_ASSOC);
		  }

		  $e = $sql->errorinfo();
		  $dados['DATA'] = array('SQL' => self::erro($e[1]), 'RESULT' => ''.$sql->rowCount().'');


		  $this->desconectar();
		  echo JSON::encode($dados);
  }
  
  public function put_new_qrcode($numero){
    //$sql = $this->conexao->prepare("UPDATE tb_smsaccount SET qr_code_b64 = null, last_update = now(), is_authenticated = false, client_id = null WHERE sender = '+$numero'");
    $sql = $this->conexao->prepare("UPDATE tb_smsaccount SET qr_code_b64 = null, last_update = now(), is_authenticated = false WHERE sender = '+$numero'");
    $sql->execute();
		  for($i = 0; $i<$sql->rowCount(); $i++){
			$dados['dados'][] = $sql->fetch(PDO::FETCH_ASSOC);
		  }

		  $e = $sql->errorinfo();
		  $dados['DATA'] = array('SQL' => self::erro($e[1]), 'RESULT' => ''.$sql->rowCount().'');


		  $this->desconectar();
		  echo JSON::encode($dados);
  }
  
  public function put_set_new_session($id_new_session, $numero){
    $sql = $this->conexao->prepare("UPDATE tb_smsaccount SET client_id = '$id_new_session' WHERE broker = 'Agecom' AND sender = '+$numero'");
    $sql->execute();
		  for($i = 0; $i<$sql->rowCount(); $i++){
			$dados['dados'][] = $sql->fetch(PDO::FETCH_ASSOC);
		  }

		  $e = $sql->errorinfo();
		  $dados['DATA'] = array('SQL' => self::erro($e[1]), 'RESULT' => ''.$sql->rowCount().'');


		  $this->desconectar();
		  echo JSON::encode($dados);
  }
  
  //public function put_set_new_qrcode($qrcode_b64, $porta, $numero){ 
  public function put_set_new_qrcode($requestData){
    $qrcode_b64 = "'" . $requestData['qrcode_b64'] . "'";
    $porta = $requestData['porta'];
    $numero = "'+" . $requestData['sender'] . "'";  
  
    $sql = $this->conexao->prepare("UPDATE tb_smsaccount SET qr_code_b64 = $qrcode_b64, porta=$porta WHERE broker = 'Agecom' AND sender = $numero");
    $sql->execute();
		  for($i = 0; $i<$sql->rowCount(); $i++){
			$dados['dados'][] = $sql->fetch(PDO::FETCH_ASSOC);
		  }

		  $e = $sql->errorinfo();
		  $dados['DATA'] = array('SQL' => self::erro($e[1]), 'RESULT' => ''.$sql->rowCount().'');


		  $this->desconectar();
		  echo JSON::encode($dados);
      //echo JSON::encode($sql);
  }
  public function put_reset_qrcode($numero){
    $sql = $this->conexao->prepare("UPDATE tb_smsaccount SET qr_code_b64 = null WHERE broker = 'Agecom' AND sender = '+$numero'");
    $sql->execute();
		  for($i = 0; $i<$sql->rowCount(); $i++){
			$dados['dados'][] = $sql->fetch(PDO::FETCH_ASSOC);
		  }

		  $e = $sql->errorinfo();
		  $dados['DATA'] = array('SQL' => self::erro($e[1]), 'RESULT' => ''.$sql->rowCount().'');


		  $this->desconectar();
		  echo JSON::encode($dados);
  }
  
  public function put_set_auth($numero){
    $sql = $this->conexao->prepare("UPDATE tb_smsaccount SET is_authenticated = true WHERE broker = 'Agecom' AND sender = '+$numero'");
    $sql->execute();
		  for($i = 0; $i<$sql->rowCount(); $i++){
			$dados['dados'][] = $sql->fetch(PDO::FETCH_ASSOC);
		  }

		  $e = $sql->errorinfo();
		  $dados['DATA'] = array('SQL' => self::erro($e[1]), 'RESULT' => ''.$sql->rowCount().'');


		  $this->desconectar();
		  echo JSON::encode($dados);
  }
  
  public function put_set_status_outbound($statusmsg,$uuid){
    $sql = $this->conexao->prepare("UPDATE public.tb_smsoutbound SET smsstatus=$statusmsg,dateupdate=now()::timestamp(0) WHERE smsmessagesid='$uuid'");
    $sql->execute();
		  for($i = 0; $i<$sql->rowCount(); $i++){
			$dados['dados'][] = $sql->fetch(PDO::FETCH_ASSOC);
		  }

		  $e = $sql->errorinfo();
		  $dados['DATA'] = array('SQL' => self::erro($e[1]), 'RESULT' => ''.$sql->rowCount().'');


		  $this->desconectar();
		  echo JSON::encode($dados);
  }
  
  public function put_group_update($nome,$group_id,$numero){
    $sql = $this->conexao->prepare("UPDATE public.tb_groups SET  nome='$nome' WHERE whatsapp_group_id='$group_id' and src='+$numero';");
    $sql->execute();
		  for($i = 0; $i<$sql->rowCount(); $i++){
			$dados['dados'][] = $sql->fetch(PDO::FETCH_ASSOC);
		  }

		  $e = $sql->errorinfo();
		  $dados['DATA'] = array('SQL' => self::erro($e[1]), 'RESULT' => ''.$sql->rowCount().'');


		  $this->desconectar();
		  echo JSON::encode($dados);
  }
  
  public function put_status_outbound($idmsg,$smsmessagesid,$accountsid,$smsstatus){
    if($smsmessagesid === null && $accountsid === null)
    {
        $sql = $this->conexao->prepare("UPDATE public.tb_smsoutbound SET smsstatus=$smsstatus, dateupdate=now()::timestamp(0), cost_cli=null WHERE idmsg=$idmsg");
    } 
    else 
    {
        $sql = $this->conexao->prepare("UPDATE public.tb_smsoutbound SET smsstatus=$smsstatus,dateupdate=now()::timestamp(0),cost_cli=null,smsmessagesid='$smsmessagesid',messagesid='$smsmessagesid',accountsid='$accountsid' WHERE idmsg=$idmsg");
    }  
    $sql->execute();
		  for($i = 0; $i<$sql->rowCount(); $i++){
			$dados['dados'][] = $sql->fetch(PDO::FETCH_ASSOC);
		  }

		  $e = $sql->errorinfo();
		  $dados['DATA'] = array('SQL' => self::erro($e[1]), 'RESULT' => ''.$sql->rowCount().'');


		  $this->desconectar();
		  echo JSON::encode($dados);
  }
  
  public function del_group_leave($group_id,$numero){
    $sql = $this->conexao->prepare("DELETE FROM public.tb_groups WHERE whatsapp_group_id = '$group_id' AND src = '+$numero' RETURNING nome;");
    $sql->execute();
		  for($i = 0; $i<$sql->rowCount(); $i++){
			$dados['dados'][] = $sql->fetch(PDO::FETCH_ASSOC);
		  }

		  $e = $sql->errorinfo();
		  $dados['DATA'] = array('SQL' => self::erro($e[1]), 'RESULT' => ''.$sql->rowCount().'');


		  $this->desconectar();
		  echo JSON::encode($dados);
  }
  
  public function ins_group_join($group_id,$nome,$numero){
    $sql = $this->conexao->prepare("INSERT INTO tb_groups (whatsapp_group_id,nome,src) SELECT '$group_id', '$nome','+$numero' WHERE NOT EXISTS (SELECT id FROM tb_groups WHERE whatsapp_group_id = '$group_id' and src='+$numero');");
    $sql->execute();
		  for($i = 0; $i<$sql->rowCount(); $i++){
			$dados['dados'][] = $sql->fetch(PDO::FETCH_ASSOC);
		  }

		  $e = $sql->errorinfo();
		  $dados['DATA'] = array('SQL' => self::erro($e[1]), 'RESULT' => ''.$sql->rowCount().'');


		  $this->desconectar();
		  echo JSON::encode($dados);
  }
  
  public function ins_msg_inbound_group($requestData){
    $mediacontenttype = isset($requestData['mediacontenttype']) ? "'" . $requestData['mediacontenttype'] . "'" : 'null';
    $smsmessagesid = "'" . $requestData['smsmessagesid'] . "'";
    $nummedia = $requestData['nummedia'];
    $smssid = "'" . $requestData['smssid'] . "'";
    $body = "'" . $requestData['body'] . "'";
    $src = "'whatsapp:+" . $requestData['src'] . "'";
    $accountsid = "'" . $requestData['accountsid'] . "'";
    $dst = "'whatsapp:+" . $requestData['dst'] . "'";
    $mediaurl = isset($requestData['mediaurl']) ? "'" . $requestData['mediaurl'] . "'" : 'null';
    $date = "'" . $requestData['date'] . "'";
    $cost_cli = isset($requestData['cost_cli']) ? "'" . $requestData['cost_cli'] . "'" : 'null';
    $latitude = isset($requestData['latitude']) ? "'" . $requestData['latitude'] . "'" : 'null';
    $longitude = isset($requestData['longitude']) ? "'" . $requestData['longitude'] . "'" : 'null';
    $profilename = "'" . $requestData['profilename'] . "'";
    $notifyname = "'" . $requestData['notifyname'] . "'";
    $author = "'" . $requestData['author'] . "'";
    $isforwarded = $requestData['isforwarded'] ? 'true' : 'false';
    $forwardingscore = $requestData['forwardingscore'];

    $sql = $this->conexao->prepare("INSERT INTO public.tb_smsinbound (id, mediacontenttype, smsmessagesid, nummedia, smsstatus, smssid, body, src, numsegments, messagesid, accountsid, dst, mediaurl, apiversion, date, errorcode, datesent, dateupdate, errormessage, ticket_id, coletado, cost, unit, cost_cli, latitude, longitude, profilename, notifyname, author, isforwarded, forwardingscore) VALUES (DEFAULT, $mediacontenttype, $smsmessagesid, 0, $nummedia, $smssid, $body, $src, 1, $smsmessagesid, $accountsid, $dst, $mediaurl, '2010-04-01', $date, null, null, null, null, null, false, null, null,$cost_cli, $latitude, $longitude, $profilename, $notifyname, $author, $isforwarded, $forwardingscore);");
    $sql->execute();
		  for($i = 0; $i<$sql->rowCount(); $i++){
			$dados['dados'][] = $sql->fetch(PDO::FETCH_ASSOC);
		  }

		  $e = $sql->errorinfo();
		  $dados['DATA'] = array('SQL' => self::erro($e[1]), 'RESULT' => ''.$sql->rowCount().'');


		  $this->desconectar();
		  //echo JSON::encode($sql);
      echo JSON::encode($dados);
  }
  
  public function ins_msg_inbound($requestData){
    $mediacontenttype = isset($requestData['mediacontenttype']) ? "'" . $requestData['mediacontenttype'] . "'" : 'null';
    $smsmessagesid = "'" . $requestData['smsmessagesid'] . "'";
    $nummedia = $requestData['nummedia'];
    $smssid = "'" . $requestData['smssid'] . "'";
    $body = "'" . $requestData['body'] . "'";
    $src = "'whatsapp:+" . $requestData['src'] . "'";
    $accountsid = "'" . $requestData['accountsid'] . "'";
    $dst = "'whatsapp:+" . $requestData['dst'] . "'";
    $mediaurl = isset($requestData['mediaurl']) ? "'" . $requestData['mediaurl'] . "'" : 'null';
    $date = "'" . $requestData['date'] . "'";
    $cost_cli = isset($requestData['cost_cli']) ? "'" . $requestData['cost_cli'] . "'" : 'null';
    $latitude = isset($requestData['latitude']) ? "'" . $requestData['latitude'] . "'" : 'null';
    $longitude = isset($requestData['longitude']) ? "'" . $requestData['longitude'] . "'" : 'null';
    $profilename = "'" . $requestData['profilename'] . "'";
    $isforwarded = $requestData['isforwarded'] ? 'true' : 'false';
    $forwardingscore = $requestData['forwardingscore'];

    $sql = $this->conexao->prepare("INSERT INTO public.tb_smsinbound (id, mediacontenttype, smsmessagesid, nummedia, smsstatus, smssid, body, src, numsegments, messagesid, accountsid, dst, mediaurl, apiversion, date, errorcode, datesent, dateupdate, errormessage, ticket_id, coletado, cost, unit, cost_cli, latitude, longitude, profilename, isforwarded, forwardingscore) VALUES (DEFAULT, $mediacontenttype, $smsmessagesid, 0, $nummedia, $smssid, $body, $src, 1, $smsmessagesid, $accountsid, $dst, $mediaurl, '2010-04-01', $date, null, null, null, null, null, false, null, null, $cost_cli, $latitude, $longitude, $profilename, $isforwarded, $forwardingscore);");
    $sql->execute();
		  for($i = 0; $i<$sql->rowCount(); $i++){
			$dados['dados'][] = $sql->fetch(PDO::FETCH_ASSOC);
		  }

		  $e = $sql->errorinfo();
		  $dados['DATA'] = array('SQL' => self::erro($e[1]), 'RESULT' => ''.$sql->rowCount().'');


		  $this->desconectar();
		  //echo JSON::encode($sql);
      echo JSON::encode($dados);
      //echo JSON::encode($requestData);
  }
  
  /*public function ins_msg_inbound_group($mediacontenttype,$smsmessagesid,$nummedia,$smssid,$body,$src,$accountsid,$dst,$mediaurl,$date,$cost_cli,$latitude,$longitude,$profilename,$notifyname,$author,$isforwarded,$forwardingscore){
    $sql = $this->conexao->prepare("INSERT INTO public.tb_smsinbound (id, mediacontenttype, smsmessagesid, nummedia, smsstatus, smssid, body, src, numsegments, messagesid, accountsid, dst, mediaurl, apiversion, date, errorcode, datesent, dateupdate, errormessage, ticket_id, coletado, cost, unit, cost_cli, latitude, longitude, profilename, notifyname, author, isforwarded, forwardingscore) VALUES (DEFAULT, $mediacontenttype, '$smsmessagesid', 0, $nummedia, '$smssid', '$body', 'whatsapp:+$src', 1, '$smsmessagesid', '$accountsid', 'whatsapp:+$dst', $mediaurl, '2010-04-01', '$date', null, null, null, null, null, false, null, null,$cost_cli, $latitude, $longitude, '$profilename', '$notifyname', '$author', $isforwarded, $forwardingscore);");
    $sql->execute();
		  for($i = 0; $i<$sql->rowCount(); $i++){
			$dados['dados'][] = $sql->fetch(PDO::FETCH_ASSOC);
		  }

		  $e = $sql->errorinfo();
		  $dados['DATA'] = array('SQL' => self::erro($e[1]), 'RESULT' => ''.$sql->rowCount().'');


		  $this->desconectar();
		  echo JSON::encode($dados);
  }
  */
  
  /*public function ins_msg_inbound($requestData) {
    $mediacontenttype = $requestData['mediacontenttype'];
    $smsmessagesid = $requestData['smsmessagesid'];
    $nummedia = $requestData['nummedia'];
    $smssid = $requestData['smssid'];
    $body = $requestData['body'];
    $src = $requestData['src'];
    $accountsid = $requestData['accountsid'];
    $dst = $requestData['dst'];
    $mediaurl = $requestData['mediaurl'];
    $date = $requestData['date'];
    $cost_cli = $requestData['cost_cli'];
    $latitude = $requestData['latitude'];
    $longitude = $requestData['longitude'];
    $profilename = $requestData['profilename'];
    $isforwarded = $requestData['isforwarded'];
    $forwardingscore = $requestData['forwardingscore'];

    $sql = $this->conexao->prepare("INSERT INTO public.tb_smsinbound (id, mediacontenttype, smsmessagesid, nummedia, smsstatus, smssid, body, src, numsegments, messagesid, accountsid, dst, mediaurl, apiversion, date, errorcode, datesent, dateupdate, errormessage, ticket_id, coletado, cost, unit, cost_cli, latitude, longitude, profilename, isforwarded, forwardingscore) VALUES (DEFAULT, :mediacontenttype, :smsmessagesid, 0, :nummedia, :smssid, :body, :src, 1, :smsmessagesid, :accountsid, :dst, :mediaurl, '2010-04-01', :date, null, null, null, null, null, false, null, null, :cost_cli, :latitude, :longitude, :profilename, :isforwarded, :forwardingscore)");

    $sql->execute(array(
        ':mediacontenttype' => $mediacontenttype,
        ':smsmessagesid' => $smsmessagesid,
        ':nummedia' => $nummedia,
        ':smssid' => $smssid,
        ':body' => $body,
        ':src' => 'whatsapp:+' . $src,
        ':accountsid' => $accountsid,
        ':dst' => 'whatsapp:+' . $dst,
        ':mediaurl' => $mediaurl,
        ':date' => $date,
        ':cost_cli' => $cost_cli,
        ':latitude' => $latitude,
        ':longitude' => $longitude,
        ':profilename' => $profilename,
        ':isforwarded' => $isforwarded,
        ':forwardingscore' => $forwardingscore
    ));

    $dados = array();
    for ($i = 0; $i < $sql->rowCount(); $i++) {
        $dados['dados'][] = $sql->fetch(PDO::FETCH_ASSOC);
    }
    $e = $sql->errorinfo();
    $dados['DATA'] = array('SQL' => self::erro($e[1]), 'RESULT' => '' . $sql->rowCount() . '');
    $this->desconectar();
    //return json_encode($dados);
    return json_encode($sql);
}*/

  
	protected function erro($code){

		if ( $code == 0000):
			return 'Query executada com sucesso!';
endif;

if ($code == 1146):
	return 'Tabela não existe.';
endif;
if ($code == 99999):
	return 'Erro update.';
endif;


	}


}
