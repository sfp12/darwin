<?php

/**
 * 首页--controller
 * @author liu_yuzhong
 * todo::后续业务逻辑，需要处理
 *
 */
class Controller_Login extends Controller_Base
{


    protected $_users;
    protected $_analysis;

    public function __construct()
    {
        $this->_users = new Model_User();
    }

    public function actionIndex()
    {

        $this->smarty->assign('title', "登录页面");
        $this->smarty->display('login/login.tpl');
    }

    public function actionDoLogin()
    {
        $result = array(
            'status' => 1,
            'data'   => '用户名或密码错误',
        );

        if ($_POST) {
            //1.检查
            $result   = array();
            $username = isset($_POST['username']) ? $_POST['username'] : '';
            $email    = isset($_POST['email']) ? $_POST['email'] : '';
            $password = isset($_POST['pwd']) ? $_POST['pwd'] : '';
            $code     = isset($_POST['code']) ? $_POST['code'] : '';
            if ($code !== $_SESSION['validcode']) {
                $result = array(
                    'status' => 1,
                    'data'   => '验证码错误',
                );
            } else if ($userinfo = $this->_users->checkLogin($email, $password)) {
                $_SESSION['userInfo'] = $userinfo;
                $result               = array(
                    'status' => 0,
                    'data'   => array(
                        'userId'   => intval($userinfo['user_id']),
                        'userName' => $userinfo['user_name'],
                    )
                );
            } else {
                $result = array(
                    'status' => 1,
                    'data'   => '用户名或密码错误',
                );
            }
        }
        echo json_encode($result);
        exit;
    }

    public function actionLogOut()
    {
       session_destroy();
       session_unset();
       $this->_response->redirect('http://'.$_SERVER['HTTP_HOST'].'/login');

    }

    //获取验证码
    public function actionGetCode()
    {
        $code = new Lib_ValidateCode();
        $code->getImg();
    }


    public function actionRegister()
    {
        $email = $_POST['email'];
        if (!$this->emailCheck($email)) {
            echo json_decode(array('status' => 1, 'data' => '你输入的email不合法'));
            exit;
        }
        $objUserModel = new Model_User();
        if (!$objUserModel->checkEmail($email)) {
            $userInfo = array(
                'email'       => $email,
                'pwd'         => '',
                'user_status' => 2,
            );
            $objUserModel->addUser($userInfo);
            echo json_decode(array('status' => 1, 'data' => '你的email申请通过，请等待审核'));
            exit;
            //todo::发送邮件功能还需要调整
            require_once '../classes/lib/phpmailer/class.phpmailer.php';
            try {
                $mail = new PHPMailer(true);
                $mail->IsSMTP();
                $mail->CharSet  = 'UTF-8'; //设置邮件的字符编码，这很重要，不然中文乱码
                $mail->SMTPAuth = true;                  //开启认证
                $mail->Port     = 25;
                $mail->Host     = "smtp.163.com";
                $mail->Username = "18600440538@163.com";
                $mail->Password = "qwe123";
                //$mail->IsSendmail(); //如果没有sendmail组件就注释掉，否则出现“Could  not execute: /var/qmail/bin/sendmail ”的错误提示
                $mail->AddReplyTo("18600440538@163.com", "mckee");//回复地址
                $mail->From     = "darwin001@yeah.net";
                $mail->FromName = "darwin.cm";
                $to             = "649049479@qq.com";
                $mail->AddAddress($to);
                $mail->Subject  = "darwin项目申请邮件";
                $mail->Body     = "<h1>dddd</h1>";
                $mail->AltBody  = "dddd"; //当邮件不支持html时备用显示，可以省略
                $mail->WordWrap = 80; // 设置每行字符串的长度
                //$mail->AddAttachment("f:/test.png");  //可以添加附件
                $mail->IsHTML(true);
                $mail->Send();
                echo json_decode(array('status' => 0, 'data' => '邮件已发送'));
            } catch (phpmailerException $e) {
                echo json_decode(array('status' => 0, 'data' => '邮件发送失败'));
            }
        } else {
            echo json_decode(array('status' => 1, 'data' => '你的email已经申请过了'));
            exit;
        }

    }
}
