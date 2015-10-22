<?php

/**
 * 首页--controller
 * @author liu_yuzhong
 *
 */
class Controller_Index extends Controller_Base {



    public function __construct() {
    }

    public function actionIndex() {
        $this->smarty->assign('title', "首页");
        $this->smarty->assign('userInfo',$_SESSION['userInfo']);
        $this->smarty->display('index/index.tpl');
    }


}
