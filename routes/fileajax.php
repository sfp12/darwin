<?php

/**
 * Ajax异步请求
 * @author liu_yuzhong
 *
 */
class Controller_FileAjax extends Controller_Base
{
    public $_dataModel = '';

    public function __construct()
    {
        $this->_dataModel = new Model_Data();
    }

    public function actionGetFiles()
    {
        $userId = $_POST['uid'];
    }


}
