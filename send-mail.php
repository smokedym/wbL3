<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Получаем данные из формы
    $fio           = htmlspecialchars($_POST['fio']);
    $organization  = htmlspecialchars($_POST['organization']);
    $email         = htmlspecialchars($_POST['email']);
    $phone         = htmlspecialchars($_POST['phone']);
    $messageContent= htmlspecialchars($_POST['message']);

    // Тело письма
    $body  = "ФИО: $fio\n";
    $body .= "Организация: $organization\n";
    $body .= "Email: $email\n";
    $body .= "Телефон: $phone\n";
    $body .= "Сообщение: $messageContent\n";

    // Замените следующую строку на ваш адрес электронной почты
    $to = "equant@equant.su";

    // Фиксированный адрес отправителя и имя отправителя
    $fromEmail = "equant@equant.su";
    $fromName  = "Заявка с сайта Equant";

    // Тема письма (объединена с полем 'Тема обращения')
    $themeMail = "Заявка с сайт Equant.su";
    // Заголовки письма
    $headers  = "From: \"$fromName\" <$fromEmail>\r\n";
    $headers .= "Subject: $themeMail\r\n";
    $headers .= "Reply-To: $email\r\n";

    // Формирование границы для multipart/mixed
    $boundary = md5(uniqid(time()));

    // Добавляем границу в заголовки
    $headers .= "Content-Type: multipart/mixed; boundary=\"$boundary\"\r\n";

    // Собираем тело письма
    $message = "--$boundary\r\n";
    $message .= "Content-Type: text/plain; charset=UTF-8\r\n";
    $message .= "Content-Transfer-Encoding: 7bit\r\n\r\n";
    $message .= $body . "\r\n";
    $message .= "--$boundary\r\n";

    // Добавляем файлы из поля "documents"
    if (isset($_FILES['documents']) && !empty($_FILES['documents']['name'][0])) {
        // Проверяем, является ли $_FILES['documents']['name'] массивом
        if (!is_array($_FILES['documents']['name'])) {
            // Если это не массив (то есть загружен только один файл), преобразуем в массив
            $_FILES['documents']['name'] = [$_FILES['documents']['name']];
            $_FILES['documents']['type'] = [$_FILES['documents']['type']];
            $_FILES['documents']['tmp_name'] = [$_FILES['documents']['tmp_name']];
            $_FILES['documents']['error'] = [$_FILES['documents']['error']];
            $_FILES['documents']['size'] = [$_FILES['documents']['size']];
        }

        for ($i = 0; $i < count($_FILES['documents']['name']); $i++) {
            if ($_FILES['documents']['error'][$i] == 0) {
                $filename  = $_FILES['documents']['name'][$i];
                $filedata  = file_get_contents($_FILES['documents']['tmp_name'][$i]);
                $filedata  = chunk_split(base64_encode($filedata));
                $filetype  = $_FILES['documents']['type'][$i];

                $message .= "Content-Type: $filetype; name=\"$filename\"\r\n";
                $message .= "Content-Transfer-Encoding: base64\r\n";
                $message .= "Content-Disposition: attachment; filename=\"$filename\"\r\n\r\n";
                $message .= $filedata . "\r\n";
                $message .= "--$boundary\r\n";
            }
        }
    }

    // Завершаем multipart/mixed сообщение
    $message .= "--$boundary--\r\n";

    // Отправка письма
    if (mail($to, $subject, $message, $headers)) {
        // Успешная отправка
        echo json_encode(['success' => true, 'message' => 'Thank you! Your form has been submitted successfully.']);
    } else {
        // Ошибка отправки
        echo json_encode(['success' => false, 'message' => 'There was an error sending your message.']);
    }
}
?>