<?php

/**
 * Ajax异步请求
 * @author liu_yuzhong
 *
 */
class Controller_IndexAjax extends Controller_Base
{
    public $_dataModel = '';

    public function __construct()
    {
        $this->_dataModel = new Model_Data();
    }

    
    public function actionGetIndexData()
    {
        $userId = $_SESSION['userInfo']['user_id'];

        $dataList = $this->_dataModel->getDataList($userId, array('data_id,data_name,user_id'));

        $resultModel = new Model_Result();
        $resultList = $resultModel->getResultList($userId,array('data_id','type','ret_id'));

        $graphsModel = new Model_Graphs();
        $graphsList = $graphsModel->getGraphsList($userId,array('data_id','type','g_id'));

        $return = array(
            'files'=>array(),
            'results'=>array(),
            'graphs'=>array(),
        );

        $dataMap = array();
        //处理filelist
        if($dataList){
            foreach($dataList as $data){
                $return['files'][] = array(
                    'dataId'=>$data['data_id'],
                    'dataName'=>$data['data_name'],
                );
                $dataMap[$data['data_id']] = $data['data_name'];
            }
        }
        //处理result
        if($resultList){
            foreach($resultList as $result){
                $dataId = $result['data_id'];
                $dataName = $dataMap[$dataId];

                $key = 'result_'.$dataId;
                if(!isset( $return['results'][$key])){
                    $return['results'][$key]['dataId'] = $dataId;
                    $return['results'][$key]['dataName'] = $dataName;
                }
                $return['results'][$key]['resultList'][] = array(
                    'resultId'=>$result['ret_id'],
                    'resultName'=>$dataName.$result['type']."的分析结果",
                    'resultType'=>$result['type'],
                );
            }
        }

        //处理graphs
        if($graphsList){
            foreach($graphsList as $graphs){
                $dataId = $graphs['data_id'];
                $dataName = $dataMap[$dataId];

                $key = 'graphs_'.$dataId;
                if(!isset( $return['graphs'][$key])){
                    $return['graphs'][$key]['dataId'] = $dataId;
                    $return['graphs'][$key]['dataName'] = $dataName;
                }
                $return['graphs'][$key]['graphsList'][] = array(
                    'graphsId'=>$graphs['g_id'],
                    'graphsName'=>$dataName.$graphs['type']."的分析结果",
                    'graphsType'=>$graphs['type'],
                );
            }
        }

        echo json_encode(array('status'=>0,'data'=>$return));
    }


    public function actionAccessibility()
    {
        $email = $_POST['email'];
        if(!$this->emailCheck($email)){
            echo json_decode(array('status'=>1,'data'=>'你输入的email不合法'));
            exit;
        }
        $objUserModel = new Model_User();
        if($objUserModel->checkEmail($email)){
            header("content-type:text/html;charset=utf-8");
            ini_set("magic_quotes_runtime",0);
            require '../classes/lib/phpmailer/class.phpmailer.php';
            try {
                $mail = new PHPMailer(true);
                $mail->IsSMTP();
                $mail->CharSet='UTF-8'; //设置邮件的字符编码，这很重要，不然中文乱码
                $mail->SMTPAuth   = true;                  //开启认证
                $mail->Port       = 25;
                $mail->Host       = "smtp.163.com";
                $mail->Username   = "darwin001@yeah.net";
                $mail->Password   = "wangzhigang";
                //$mail->IsSendmail(); //如果没有sendmail组件就注释掉，否则出现“Could  not execute: /var/qmail/bin/sendmail ”的错误提示
                $mail->AddReplyTo("darwin001@yeah.net","mckee");//回复地址
                $mail->From       = "darwin001@yeah.net";
                $mail->FromName   = "darwin.cm";
                $to = "649049479@qq.com";
                $mail->AddAddress($to);
                $mail->Subject  = "darwin项目申请邮件";
                $mail->Body = "<h1>phpmail演示</h1>点击进行人员管理审核（<font color=red>darwin.cm</font>）";
                $mail->AltBody    = "To view the message, please use an HTML compatible email viewer!"; //当邮件不支持html时备用显示，可以省略
                $mail->WordWrap   = 80; // 设置每行字符串的长度
                //$mail->AddAttachment("f:/test.png");  //可以添加附件
                $mail->IsHTML(true);
                $mail->Send();
                echo json_decode(array('status'=>0,'data'=>'邮件已发送'));
            } catch (phpmailerException $e) {
                echo json_decode(array('status'=>0,'data'=>'邮件发送失败'));
            }
        }
        else{
            echo json_decode(array('status'=>1,'data'=>'你的email已经申请过了'));
            exit;
        }

    }

    /**
     * 保存数据
     */
    public function actionSave()
    {

        $dataInfo = json_decode($_POST['fileData'], true);
        $data   = array(
            'user_id'   => $_POST['userId'],
            'data_name' => $_POST['fileName'],
            'data_info' => json_encode($dataInfo['data']),
        );
        $result = array();

        //保存操作
        if(isset($_POST['dataId'])){
            $data['data_id'] = intval($_POST['dataId']);
            $ret = $this->_dataModel->saveData($data);
        }else{
            $ret = $this->_dataModel->addData($data);
        }
        
        if ($ret!==false) {
            $result = array(
                'status' => 0,
                'data'   => '操作成功',
            );
        } else {
            $result = array(
                'status' => 1,
                'data'   => '操作失败',
            );
        }
        echo json_encode($result);
    }

    /**
     * 保存数据
     */
    public function actionSaveName()
    {
        $dataName = $_POST['fileName'];
        $id       = $_POST['dataId'];

        $data = array(
            'data_id'   => $id,
            'data_name' => $dataName,
        );
        if ($this->_dataModel->saveName($data)!==false) {
            $result = array(
                'status' => 0,
                'data'   => '操作成功',
            );
        } else {
            $result = array(
                'status' => 1,
                'data'   => '操作失败',
            );
        }
        echo json_encode($result);
    }

    public function actionSaveAs()
    {
        $dataInfo          = json_decode($_POST['fileData'], true);
        $data['data_name'] = $_POST['fileName'];
        $data['data_info'] = json_encode($dataInfo['data']);
        $data['user_id']   = $_POST['userId'];
        // var_dump($data);
        if ($this->_dataModel->addData($data)) {
            $result = array(
                'status' => 0,
                'data'   => '操作成功',
            );
        } else {
            $result = array(
                'status' => 1,
                'data'   => '操作失败',
            );
        }
        echo json_encode($result);
    }

    public function actionGet()
    {
        if(!isset($_POST['dataId'])){
            echo json_encode(array());
            exit;
        }
        $data_id = $_POST['dataId'];
        $user_id = $_SESSION['userInfo']['user_id'];
        $data    = $this->_dataModel->getDataById($data_id,$user_id);

        $ret = array(
            'status' => 0,
            'data'   => $data
        );
        echo json_encode($ret);
        exit;
    }


    public function actionDelete()
    {
        if(!isset($_POST['dataId'])){
            echo json_encode(array());
            exit;
        }
        $data_id = $_POST['dataId'];
        $user_id = $_SESSION['userInfo']['user_id'];
        $data    = $this->_dataModel->delete($data_id,$user_id);

        $ret = array(
            'status' => 0,
            'data'   => '操作成功'
        );
        echo json_encode($ret);
        exit;
    }
}
