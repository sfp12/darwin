<?php  
require('Smarty.class.php');
$smarty = new Smarty;  
$smarty->template_dir='templates'; 
$smarty->config_dir='configs'; 
$smarty->cache_dir='cache'; 
$smarty->compile_dir='templates_c'; 
$smarty->assign("name",$_POST['name']); 
$smarty->display('index.tpl'); 
?> 
