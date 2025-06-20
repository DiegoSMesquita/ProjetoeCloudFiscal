#!/bin/bash

DATA=$(date +"%Y-%m-%d_%H-%M-%S")
mysqldump -h meuhost.mysql.uhserver.com -u meuusuario -p'MINHASENHA' ecloudfiscal > backup_$DATA.sql