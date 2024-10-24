package controllers

import (
	"fmt"
	"net/http"

	"github.com/erneap/go-models/notifications"
	"github.com/erneap/go-models/svcs"
	"github.com/erneap/scheduler3/scheduler-api/models/web"
	"github.com/gin-gonic/gin"
)

func GetMessagesForEmployee(c *gin.Context) {
	userid := c.Param("userid")
	logmsg := "NotificationsController: GetMEssageForEmployee:"

	if userid == "" {
		resp := &web.NotificationResponse{
			Exception: "No userid given",
		}
		c.JSON(http.StatusBadRequest, resp)
		return
	}

	msgs, err := svcs.GetMessagesByEmployee(userid)
	if err != nil {
		svcs.CreateDBLogEntry("SchedulerAPI", "ERROR", "GetMessages Problem", "",
			fmt.Sprintf("%s GetMessagesByEmployee: %s", logmsg, err.Error()), c)
		resp := &web.NotificationResponse{
			Exception: err.Error(),
		}
		c.JSON(http.StatusBadRequest, resp)
		return
	}

	resp := &web.NotificationResponse{
		Messages:  msgs,
		Exception: "",
	}
	c.JSON(http.StatusOK, resp)
}

func GetMessage(c *gin.Context) {
	messageid := c.Param("id")
	logmsg := "NotificationsController: GetMessage:"

	if messageid == "" {
		resp := &web.NotificationResponse{
			Exception: "No message id given",
		}
		c.JSON(http.StatusBadRequest, resp)
		return
	}

	msgs, err := svcs.GetMessage(messageid)
	if err != nil {
		svcs.CreateDBLogEntry("SchedulerAPI", "ERROR", "GetMessage Problem", "",
			fmt.Sprintf("%s GetMessage Problem: %s", logmsg, err.Error()), c)
		resp := &web.NotificationResponse{
			Exception: err.Error(),
		}
		c.JSON(http.StatusBadRequest, resp)
		return
	}

	var messages []notifications.Notification
	messages = append(messages, msgs)
	resp := &web.NotificationResponse{
		Messages:  messages,
		Exception: "",
	}
	c.JSON(http.StatusOK, resp)
}

func GetAllMessages(c *gin.Context) {
	msgs, err := svcs.GetAllMessages()
	logmsg := "NotificationsController: GetAllMessages:"
	if err != nil {
		svcs.CreateDBLogEntry("SchedulerAPI", "ERROR", "GetMessages Problem", "",
			fmt.Sprintf("%s GetMessages Problem: %s", logmsg, err.Error()), c)
		resp := &web.NotificationResponse{
			Exception: err.Error(),
		}
		c.JSON(http.StatusBadRequest, resp)
		return
	}

	resp := &web.NotificationResponse{
		Messages:  msgs,
		Exception: "",
	}
	c.JSON(http.StatusOK, resp)
}

func CreateMessage(c *gin.Context) {
	var data web.MessageRequest
	logmsg := "NotificationsController: CreateMessage:"

	if err := c.ShouldBindJSON(&data); err != nil {
		svcs.CreateDBLogEntry("SchedulerAPI", "ERROR", "Binding Problem", "",
			fmt.Sprintf("%s DataBinding Problem: %s", logmsg, err.Error()), c)
		c.JSON(http.StatusBadRequest,
			web.NotificationResponse{
				Exception: err.Error(),
			})
		return
	}

	err := svcs.CreateMessage(data.To, data.From, data.Message)
	if err != nil {
		svcs.CreateDBLogEntry("SchedulerAPI", "ERROR", "CreateMessage Problem", "",
			fmt.Sprintf("%s CreateMessage Problem: %s", logmsg, err.Error()), c)
		resp := &web.NotificationResponse{
			Exception: err.Error(),
		}
		c.JSON(http.StatusBadRequest, resp)
		return
	}

	messages, _ := svcs.GetMessagesByEmployee(data.UserID)
	resp := &web.NotificationResponse{
		Messages:  messages,
		Exception: "",
	}
	c.JSON(http.StatusOK, resp)
}

func AcknowledgeMessages(c *gin.Context) {
	var data web.NotificationAck
	logmsg := "NotificationsController: AcknowledgeMessages:"

	if err := c.ShouldBindJSON(&data); err != nil {
		svcs.CreateDBLogEntry("SchedulerAPI", "ERROR", "Binding Problem", "",
			fmt.Sprintf("%s DataBinding Problem: %s", logmsg, err.Error()), c)
		c.JSON(http.StatusBadRequest,
			web.NotificationResponse{
				Exception: err.Error(),
			})
		return
	}

	exceptions := ""
	userid := ""
	if len(data.Messages) > 0 {
		for m, msg := range data.Messages {
			if userid == "" {
				message, err := svcs.GetMessage(msg)
				if err == nil {
					userid = message.To
				}
			}
			err := svcs.DeleteMessage(msg)
			if err != nil {
				if exceptions != "" {
					exceptions += ";"
				}
				exceptions += fmt.Sprintf("Message %d: %s", m, err.Error())
			}
		}
	}
	if exceptions != "" {
		svcs.CreateDBLogEntry("SchedulerAPI", "ERROR", "Exceptions", "",
			fmt.Sprintf("%s Exceptions Noted: %s", logmsg, exceptions), c)
		resp := &web.NotificationResponse{
			Exception: exceptions,
		}
		c.JSON(http.StatusBadRequest, resp)
		return
	}

	messages, _ := svcs.GetMessagesByEmployee(userid)
	msgList := ""
	for _, msg := range data.Messages {
		if msgList != "" {
			msgList += ","
		}
		msgList += msg
	}
	resp := &web.NotificationResponse{
		Messages:  messages,
		Exception: "",
	}
	c.JSON(http.StatusOK, resp)
}
