#!/bin/bash
#By Michel -> 22/01/2024

echo "##########Menu Interativo:##########"
echo "#"
echo "#"
echo -e "#\t1. Criar novo cliente Node WhatsApp"
echo -e "#\t2. Reiniciar Sessão do cliente Node WhatsApp"
echo -e "#\t3. Excluir cliente Node WhatsApp"
echo -e "#\t4. Habilitar/Desabilitar cliente Node WhatsApp do monitor PM2"
echo -e "#\t5. Atualizar cliente Node WhatsApp"
echo -e "#\t6. Preparar servidor -> Script instalação dependências .NET Core/Node WhatsApp PG"
echo "#"
echo "#"
echo "####################################"

read -p "Escolha uma opção (1, 2, 3, 4, 5 ou 6): " opcao

function validar_numero {
    read -p "Digite o parâmetro NÚMERO (12 ou 13 dígitos -> exemplo: 5511988887766): " numero
    numero=$(echo "$numero" | tr -d '[:space:]')  # Remove espaços inicio e fim
    if ! [[ "$numero" =~ ^[0-9]{12,13}$ ]]; then
        echo "Erro: O segundo parâmetro deve ser um número com 12 ou 13 dígitos."
        validar_numero
    fi
}

function validar_porta {
    read -p "Digite o parâmetro PORTA (5 dígitos): " porta
    porta=$(echo "$porta" | tr -d '[:space:]')
    if ! [[ "$porta" =~ ^[0-9]{5}$ ]]; then
        echo "Erro: O terceiro parâmetro deve ser um número com exatamente 5 dígitos."
        validar_porta
    fi
}

function validar_nome {
    read -p "Digite o parâmetro NOME em maiúsculo (exemplo PG_CLIENTE): " nomeCliente
    nomeCliente=$(echo "$nomeCliente" | tr -d '[:space:]')
    if [[ "$nomeCliente" =~ ^[A-Z_]{1,25}$ ]]; then
        return
    else
        echo "Erro: O campo NOME deve conter somente letras maiúsculas, ser separado por underscores (_) e ter no máximo 25 caracteres."
        validar_nome
    fi
}

function validar_usuario_api {
    read -p "Digite o parâmetro USUÁRIO API WhatsApp (máximo 25 caracteres): " usuarioAPI
    usuarioAPI=$(echo "$usuarioAPI" | tr -d '[:space:]')
    if [ ${#usuarioAPI} -le 25 ]; then
        return
    else
        echo "Erro: O campo USUÁRIO API deve ter no máximo 25 caracteres."
        validar_usuario_api
    fi
}

function validar_senha_api {
    read -p "Digite o parâmetro SENHA API WhatsApp (máximo 32 caracteres): " senhaAPI
    senhaAPI=$(echo "$senhaAPI" | tr -d '[:space:]')
    if [ ${#senhaAPI} -le 32 ]; then
        return
    else
        echo "Erro: O campo SENHA API deve ter no máximo 32 caracteres."
        validar_senha_api
    fi
}

case $opcao in
    1)
        echo "Você escolheu criar um novo cliente Node."
        
        validar_nome
        validar_numero
        validar_porta
        validar_usuario_api
        validar_senha_api
        
        echo "Contador regressivo de 5 segundos -> criando novo cliente..."
        for i in {5..1}; do
            echo "$i"
            sleep 1
        done
        
        cd /root/WhatsApp_Clients/Node_Whatsapp_Api
        echo 'Atualizando aplicação repositório GIT ...'
        git pull

        echo 'Criando nova instância do aplicativo'
        cp -ruf $HOME/WhatsApp_Clients/Node_Whatsapp_Api/ $HOME/WhatsApp_Clients/Node_Whatsapp_Api_$numero/

        echo 'Realizando liberação de escrita/execução nos arquivos'
        chmod 775 $HOME/WhatsApp_Clients/Node_Whatsapp_Api_$numero/*
        cd $HOME/WhatsApp_Clients/Node_Whatsapp_Api_$numero/
        #chmod 775 .env
        chmod 775 .gitignore

        echo 'Criando arquivo .env'
        echo -e "PORT=$porta\nUPLOAD_USER=$usuarioAPI\nUPLOAD_PASS=$senhaAPI\nNUMERO_CLIENTE=$numero\nCONNECTIONS_POOL=10\nURL_API_SERVER=http://urlapi.qualquercoisa.com:44444/" > .env

        echo 'Atualizando pacotes npm...'
        npm install

        if test -f $HOME/$nomeCliente.sh;
             then
                echo 'Arquivo: '$nomeCliente'.sh já existe.';
             else
                echo 'criando arquivo de inicialização PM2'
                cd ~
                echo '#!/bin/bash
                cd /root/WhatsApp_Clients/Node_Whatsapp_Api_'$numero'/ && npm run dev
                ' > $nomeCliente.sh
                chmod +x $nomeCliente.sh
                echo 'INICIALIZANDO CLIENTE pm2: '$nomeCliente''
                pm2 start $HOME/$nomeCliente.sh
                pm2 save
             fi
        
        echo 'CONCLUÍDO! EXECUTE:  pm2 log '$nomeCliente''

        ;;
    2)
        echo "Você escolheu reiniciar e excluir a sessão do Cliente Node WhatsApp."

        validar_nome
        validar_numero
        validar_porta

        SESSIONS_DIR="$HOME/WhatsApp_Clients/Node_Whatsapp_Api_$numero/src/sessions/"

        echo "Contador regressivo de 5 segundos antes de reiniciar a sessão..."
        for i in {5..1}; do
            echo "$i"
            sleep 1
        done

        echo "Parar cliente '$nomeCliente'"
        pm2 stop $nomeCliente

        echo "Excluíndo arquivos de sessão do cliente: "
        echo "$SESSIONS_DIR"session-client-*;
        rm -rf "$SESSIONS_DIR"session-client-*

        if [ $? -eq 0 ]; then
            echo "Arquivos de sessão excluídos com sucesso."

            echo "Iniciando o cliente '$nomeCliente'"
            pm2 start $nomeCliente

            echo "Atualizando nova sessão do cliente no banco de dados."
            DB_USER="usuario"
            DB_PASSWORD="senhaqualquer"
            DB_NAME="dbqualquer"
            DB_HOST="127.0.0.1"
            DB_PORT="5432"

            export PGPASSWORD="$DB_PASSWORD"

            QUERY="UPDATE tb_smsaccount SET last_update = now(), is_authenticated = false, client_id = null WHERE sender LIKE '%$numero' AND porta = $porta;"

            psql -h "$DB_HOST" -p "$DB_PORT" -d "$DB_NAME" -U "$DB_USER" -c "$QUERY"

            if [ $? -eq 0 ]; then
                echo "Atualização bem-sucedida."
            else
                echo "Falha na atualização."
            fi

            unset PGPASSWORD
        else
            echo "Falha ao excluir os arquivos de sessão. Abortando."
        fi
        ;;
    3)
        echo "Você escolheu excluir o Cliente Node WhatsApp."
    
        validar_nome
        validar_numero
    
        script_path="$HOME/$nomeCliente.sh"
    
        if [ -f "$script_path" ]; then
            script_content=$(<"$script_path")
            if [[ $script_content == *"$HOME/WhatsApp_Clients/Node_Whatsapp_Api_$numero/"* ]]; then
                echo "Parando cliente: $nomeCliente do PM2"
                pm2 stop $nomeCliente
                echo "Deletando cliente: $nomeCliente do PM2"
                pm2 delete $nomeCliente
            
                echo "Deletando arquivos da aplicação"
                rm -rf "$HOME/WhatsApp_Clients/Node_Whatsapp_Api_$numero/"
                
                pm2 save
            else
                echo "O caminho da aplicação não coincide com o script de inicialização. Nenhuma exclusão realizada."
            fi
    
            echo "Deletando script de inicialização do cliente: $nomeCliente.sh"
            rm -f "$script_path"
        else
            echo "O script de inicialização não foi encontrado. Nenhuma exclusão realizada."
        fi
    
        echo "Operação concluída."
        ;;
   4)
    echo "Você escolheu habilitar/desabilitar o Cliente Node WhatsApp no monitor PM2"
    validar_nome

    #está em execução no PM2???
    if pm2 list | grep -q "\<$nomeCliente\>"; then
        echo "O Cliente está em execução. Deseja desabilitá-lo? (y/n)"
        read -r resposta

        if [ "$resposta" = "y" ]; then
            echo "Desabilitando cliente: $nomeCliente do monitor PM2"
            pm2 delete $nomeCliente
            pm2 save
            echo "Cliente desabilitado com sucesso."
        else
            echo "Operação cancelada. O Cliente permanece em execução no PM2."
        fi
    else
        echo "O Cliente não está em execução. Deseja habilitá-lo? (y/n)"
        read -r resposta

        if [ "$resposta" = "y" ]; then
            echo "Habilitando cliente: $nomeCliente no monitor PM2"
            cd "$HOME/WhatsApp_Clients/Node_Whatsapp_Api_$numero/"
            pm2 start $HOME/$nomeCliente.sh 
            pm2 save
            echo "Cliente habilitado com sucesso."
        else
            echo "Operação cancelada. O Cliente permanece desabilitado no PM2."
        fi
    fi
    ;;

    5)
        function atualizar_cliente {
        CLIENTE_DIR="$HOME/WhatsApp_Clients/Node_Whatsapp_Api_"$numero"/"
        script_path="$HOME/$nomeCliente.sh"
    
        if [ -f "$script_path" ]; then
            script_content=$(<"$script_path")
            if [[ $script_content == *"$HOME/WhatsApp_Clients/Node_Whatsapp_Api_$numero/"* ]]; then
    
                #echo $CLIENTE_DIR
                if [ -d "$CLIENTE_DIR" ]; then
                    echo "Atualizando o Cliente Node WhatsApp: $nomeCliente"
                    nomeClienteFormat=$(echo "$nomeCliente" | sed 's/_/-/g')
                    #echo "nome cliente "$nomeClienteFormat""
                    echo "Versão atual da aplicação, cliente: $nomeCliente -> $(cat version_all_node.txt | grep "$nomeClienteFormat" | awk '{print $NF}')"
                    
                    cd "$CLIENTE_DIR"
    
                    
                    if git diff-index --quiet HEAD --; then
                        echo "O Cliente já está na versão mais recente."
                    else
                        echo "Atenção: O cliente possui modificações locais. Deseja continuar? (y/n)"
                        read -r resposta
    
                        if [ "$resposta" = "y" ]; then
                            #há atualizações remotas??
                            if git fetch; then
                                echo "Parando cliente: $nomeCliente"
                                pm2 stop $nomeCliente
                                git stash
                                echo "Atualizando com as alterações mais recentes..."
                                git pull
                                npm i
                                echo "Cliente atualizado com sucesso."                              
                                echo "Reiniciando cliente: $nomeCliente"
                                pm2 restart $nomeCliente
                                #sh /bin/version_pg.sh 2>/tmp/version_pg_error.log
                                sh /bin/version_pg.sh & wait
                                echo "Versão da aplicação após atualização, cliente: $nomeCliente -> $(cat version_all_node.txt | grep "$nomeClienteFormat" | awk '{print $NF}')"
                            else
                                echo "Falha ao buscar atualizações remotas."
                            fi
                        else
                            echo "Operação cancelada. O Cliente permanece sem atualização."
                        fi
                    fi
                else
                    echo "Cliente não encontrado. Verifique se o nome está correto."
                fi
            else
                echo "Nome ou número do cliente não corresponde. Verifique os dados e tente novamente."
            fi
        fi
    }

        
        echo "Você escolheu atualizar o Cliente Node WhatsApp"
        validar_nome
        validar_numero
        atualizar_cliente "$nomeCliente"
        ;;
    6)
        echo "Você escolheu PREPARAR o servidor com as dependencias do NODE WhatsApp"
        
          echo '####################### Script instalação dependências Node WhatsApp PG #######################';
          
          function countdown {
            secs=$1
            while [ $secs -gt 0 ]; do
              echo -ne "Iniciando em $secs segundos... digite Control + c para cancelar! \r"
              sleep 1
              : $((secs--))
            done
            echo
          }
          
          countdown 30
          
          echo 'VERIFICANDO o timezone';
          timedatectl
          
          echo 'CONFIGURANDO timezone para: America/Sao_Paulo'
          timedatectl set-timezone America/Sao_Paulo
          
          export LC_ALL=pt_BR.UTF-8
          localectl set-locale LANG=pt_BR.UTF-8
          
          echo 'DESABILITANDO firewalld e selinux'
          
          systemctl stop firewalld
          systemctl disable firewalld
          
          sed -i 's/\(^SELINUX=\).*/\SELINUX=disabled/' /etc/sysconfig/selinux
          sed -i 's/\(^SELINUX=\).*/\SELINUX=disabled/' /etc/selinux/config
          
          echo '[epel]
          name=Extra Packages for Enterprise Linux 8 - $basearch
          metalink=https://mirrors.fedoraproject.org/metalink?repo=epel-8&arch=$basearch
          enabled=1
          gpgcheck=1
          gpgkey=https://dl.fedoraproject.org/pub/epel/RPM-GPG-KEY-EPEL-8
          
          [epel-debuginfo]
          name=Extra Packages for Enterprise Linux 8 - $basearch - Debug
          metalink=https://mirrors.fedoraproject.org/metalink?repo=epel-debug-8&arch=$basearch
          enabled=0
          gpgkey=https://dl.fedoraproject.org/pub/epel/RPM-GPG-KEY-EPEL-8
          gpgcheck=1
          
          [epel-source]
          name=Extra Packages for Enterprise Linux 8 - $basearch - Source
          metalink=https://mirrors.fedoraproject.org/metalink?repo=epel-source-8&arch=$basearch
          enabled=0
          gpgkey=https://dl.fedoraproject.org/pub/epel/RPM-GPG-KEY-EPEL-8
          gpgcheck=1' > /etc/yum.repos.d/epel.repo
          
          dnf clean all
          
          dnf update -y
          
          dnf group install "Development Tools"
          
          dnf install wget tar vim net-tools make python3 gcc git sqlite -y g++
          
          echo 'instalando Node com script - NVM';
          
          curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.2/install.sh | bash
          source ~/.bash_profile
          
          nvm install v18.17.0 -y
          dnf install libatk-bridge-2.0.so.0 -y
          
          echo '[google-chrome]
          name=google-chrome
          baseurl=http://dl.google.com/linux/chrome/rpm/stable/$basearch
          enabled=1
          gpgcheck=1
          gpgkey=https://dl.google.com/linux/linux_signing_key.pub' > /etc/yum.repos.d/google-chrome.repo;
          
          
          echo '####################### INSTALANDO Google Chrome (Headless/CLI) #######################';
          dnf install google-chrome-stable -y
          
          echo '[packages-microsoft-com-prod]
          name=packages-microsoft-com-prod
          baseurl=https://packages.microsoft.com/centos/8/prod
          enabled=1
          gpgcheck=1
          gpgkey=https://packages.microsoft.com/keys/microsoft.asc
          sslverify=1' > /etc/yum.repos.d/microsoft-prod.repo;
          
          echo '####################### INSTALANDO .Net CORE #######################';
          
          dnf install dotnet-sdk-6.0.x86_64 -y
          
          npm install -g pm2
          
          echo -n 'Versão Node instalada: '; node --version
          
          echo -n 'Versão NPM instalada: '; npm --version
          
          echo -n 'Versão Google Chrome instalada: '; google-chrome --version 
          
          echo -n 'Versão .Net Core instalada: '; dotnet --version
          
          echo 'ATENÇÃO - REINICIANDO EM 10 segundos... '
          echo -n "Você realmente deseja reiniciar o servidor agora? (Digite 'y' para confirmar): "
          read confirmacao
          
          if [ "$confirmacao" == "y" ]; then
              echo "Reiniciando o servidor..."
              sleep 10 && sudo shutdown -r now
          else
              echo "Operação de reinicialização cancelada pelo usuário."
          fi
        
        ;;
    *)
        echo "Opção inválida. Saindo."
        exit 1
        ;;
esac



