async function bootstrap() {
  if (figma.editorType === "figma" || figma.editorType === "figjam") {
    console.log('Initializing plugin UI');
    figma.showUI(__html__, {
      width: 800,
      height: 650,
      title: "Another chat",
    });

    // После загрузки UI — отправляем запрос на получение userId
    const storedUserId = await figma.clientStorage.getAsync("userId");
    console.log('Stored userId:', storedUserId);
    
    // Добавляем небольшую задержку, чтобы убедиться, что UI успел инициализироваться
    setTimeout(() => {
      console.log('Sending load-user-id message');
      figma.ui.postMessage({ type: "load-user-id", userId: storedUserId });
    }, 1000);
  }
}

bootstrap();

// Принимаем сообщение от UI
figma.ui.onmessage = async (msg) => {
  console.log('Received message from UI:', msg);
  if (msg.type === "save-user-id") {
    await figma.clientStorage.setAsync("userId", msg.userId);
    console.log('Saved userId:', msg.userId);
    figma.notify("User ID сохранён!");
  }
};
