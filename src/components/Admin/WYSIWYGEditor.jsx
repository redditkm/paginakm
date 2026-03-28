// components/Admin/WYSIWYGEditor.jsx

import React from "react";
import { Editor } from "@tinymce/tinymce-react";

export default function WYSIWYGEditor({ value, onChange, placeholder = "Escriba aquí..." }) {
  return (
    <Editor
      apiKey="your_tinymce_api_key_here"
      value={value}
      onEditorChange={onChange}
      init={{
        height: 400,
        menubar: "file edit view insert format tools table help",
        plugins: [
          "advlist autolink lists link image charmap print preview anchor",
          "searchreplace visualblocks code fullscreen",
          "insertdatetime media table paste code help wordcount",
          "textcolor colorpicker emoticons"
        ],
        toolbar:
          "undo redo | formatselect | bold italic backcolor textcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | link image | code fullscreen | emoticons",
        content_css: "default",
        relative_urls: false,
        remove_script_host: false,
        convert_urls: true,
        branding: false,
        statusbar: true,
        paste_data_images: true,
        automatic_uploads: false,
        file_picker_types: "image",
        image_title: true,
        image_caption: true,
        promotion: false,
        license_key: "gpl",
        placeholder: placeholder,
        font_formats: "Arial=Arial;Verdana=Verdana;Georgia=Georgia;Times New Roman=Times New Roman;Courier New=Courier New;Trebuchet MS=Trebuchet MS",
        fontsize_formats: "8pt 10pt 12pt 14pt 16pt 18pt 20pt 24pt 28pt 32pt 36pt",
        style_formats: [
          { title: "Heading 1", format: "h1" },
          { title: "Heading 2", format: "h2" },
          { title: "Heading 3", format: "h3" },
          { title: "Paragraph", format: "p" },
          { title: "Blockquote", format: "blockquote" },
          { title: "Code", format: "code" }
        ],
        table_class_list: [
          { title: "None", value: "" },
          { title: "Default", value: "default-table" }
        ]
      }}
    />
  );
}