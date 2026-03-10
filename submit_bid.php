<?php
// submit_bid.php

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // 1. Recipient Address
    $to = "estimating@kjrid.com";

    // 2. Sanitize and Assign Post Variables
    $projectName   = htmlspecialchars($_POST['projectName'] ?? 'Unknown Project');
    $bidIntent     = htmlspecialchars($_POST['bidIntent'] ?? 'Not Specified');
    $declineReason = htmlspecialchars($_POST['declineReason'] ?? 'None');
    $bidAmount     = htmlspecialchars($_POST['bidAmount'] ?? '0.00');
    $comments      = htmlspecialchars($_POST['comments'] ?? 'None');
    $companyName   = htmlspecialchars($_POST['companyName'] ?? 'Unknown Company');
    $contactPerson = htmlspecialchars($_POST['contactPerson'] ?? 'Unknown Contact');
    $emailAddress  = filter_var($_POST['emailAddress'] ?? '', FILTER_SANITIZE_EMAIL);

    // 3. Prepare Email Subject
    $subject = "Bid Response: $projectName - $companyName";

    // 4. Generate Random Boundary for Attachments
    $boundary = md5("kjrid_boundary_" . time());

    // 5. Construct Email Headers
    $headers = "MIME-Version: 1.0\r\n";
    $headers .= "From: $contactPerson <$emailAddress>\r\n";
    $headers .= "Reply-To: $emailAddress\r\n";
    $headers .= "Content-Type: multipart/mixed; boundary=\"$boundary\"\r\n";

    // 6. Build the Text Body
    $body = "--$boundary\r\n";
    $body .= "Content-Type: text/plain; charset=UTF-8\r\n";
    $body .= "Content-Transfer-Encoding: 7bit\r\n\r\n";

    $body .= "⭐ New Bid Response Received via KJRID Website ⭐\n\n";
    $body .= "===============================================\n";
    $body .= " PROJECT DETAILS\n";
    $body .= "===============================================\n";
    $body .= "Project Name: $projectName\n";
    $body .= "Intent to Bid: " . strtoupper($bidIntent) . "\n\n";

    if ($bidIntent === 'yes') {
        $body .= "Bid Amount: $" . number_format((float)$bidAmount, 2) . "\n";
        $body .= "Comments / Scope Notes:\n$comments\n\n";
    } else {
        $body .= "Reason for Declining:\n$declineReason\n\n";
    }

    $body .= "===============================================\n";
    $body .= " CONTRACTOR INFORMATION\n";
    $body .= "===============================================\n";
    $body .= "Company Name: $companyName\n";
    $body .= "Contact Person: $contactPerson\n";
    $body .= "Email Address: $emailAddress\n";
    $body .= "===============================================\n\n";

    // 7. Handle File Attachments
    if (isset($_FILES['documents'])) {
        $file_count = count($_FILES['documents']['name']);

        for ($i = 0; $i < $file_count; $i++) {
            if ($_FILES['documents']['error'][$i] === UPLOAD_ERR_OK) {
                // Get file details
                $tmp_name = $_FILES['documents']['tmp_name'][$i];
                $name     = basename($_FILES['documents']['name'][$i]);
                $type     = $_FILES['documents']['type'][$i];
                $size     = $_FILES['documents']['size'][$i];

                // Ensure file size is reasonable (e.g. < 15MB to prevent memory issues)
                if ($size < 15000000) {
                    // Read file contents
                    $file_content = file_get_contents($tmp_name);
                    // Encode to base64 and break into 76 ch chunks
                    $encoded_content = chunk_split(base64_encode($file_content));

                    // Append attachment to body
                    $body .= "--$boundary\r\n";
                    $body .= "Content-Type: $type; name=\"$name\"\r\n";
                    $body .= "Content-Disposition: attachment; filename=\"$name\"\r\n";
                    $body .= "Content-Transfer-Encoding: base64\r\n\r\n";
                    $body .= $encoded_content . "\r\n";
                }
            }
        }
    }

    // 8. Close the MIME boundary
    $body .= "--$boundary--";

    // 9. Send the Email
    $success = mail($to, $subject, $body, $headers);

    // 10. Process Feedback & Redirect
    if ($success) {
        // Redirection with success parameter
        header("Location: bid-projects.html?status=success");
        exit();
    } else {
        // In case mail() function fails
        die("Error: Unable to send the bid proposal. Please check the server's PHP mail configuration.");
    }
} else {
    // If someone visits the URL directly without POST
    header("Location: bid-projects.html");
    exit();
}
?>
