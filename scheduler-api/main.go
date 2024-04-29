package main

import (
	"fmt"

	"github.com/erneap/go-models/config"
	"github.com/erneap/go-models/svcs"
	"github.com/erneap/scheduler2/schedulerApi/controllers"
	"github.com/gin-gonic/gin"
)

func main() {
	fmt.Println("Starting")

	// run database
	config.ConnectDB()

	// add routes
	router := gin.Default()
	roles := []string{"ADMIN", "SCHEDULER", "siteleader", "company", "teamleader"}
	siteRoles := []string{"SCHEDULER", "siteleader", "company", "teamleader", "ADMIN"}
	teamRoles := []string{"teamleader", "ADMIN"}
	api := router.Group("/api/v2/scheduler")
	{
		api.GET("/:userid", svcs.CheckJWT("scheduler"), controllers.GetInitial)
		emp := api.Group("/employee")
		{
			emp.GET("/:empid", svcs.CheckJWT("scheduler"), controllers.GetEmployee)
			emp.POST("/", svcs.CheckJWT("scheduler"), svcs.CheckRoles("scheduler", roles),
				controllers.CreateEmployee)
			emp.PUT("/", svcs.CheckJWT("scheduler"), controllers.UpdateEmployeeBasic)
			emp.DELETE("/:empid", svcs.CheckJWT("scheduler"), controllers.DeleteEmployee)
			asgmt := emp.Group("/assignment").Use(svcs.CheckJWT("scheduler"))
			{
				asgmt.POST("/", controllers.CreateEmployeeAssignment)
				asgmt.PUT("/", controllers.UpdateEmployeeAssignment)
				asgmt.PUT("/workday", controllers.UpdateEmployeeAssignmentWorkday)
				asgmt.DELETE("/:empid/:asgmtid",
					controllers.DeleteEmployeeAssignment)
			}
			vari := emp.Group("/variation").Use(svcs.CheckJWT("scheduler"))
			{
				vari.POST("/", controllers.CreateEmployeeVariation)
				vari.PUT("/", controllers.UpdateEmployeeVariation)
				vari.PUT("/workday", controllers.UpdateEmployeeVariationWorkday)
				vari.DELETE("/:empid/:variid", controllers.DeleteEmployeeVariation)
			}
			balance := emp.Group("/balance").Use(svcs.CheckJWT("scheduler"))
			{
				balance.POST("/", controllers.CreateEmployeeLeaveBalance)
				balance.PUT("/", controllers.UpdateEmployeeLeaveBalance)
				balance.DELETE("/:empid/:year", controllers.DeleteEmployeeLeaveBalance)
			}
			leaves := emp.Group("/leaves").Use(svcs.CheckJWT("scheduler"))
			{
				leaves.POST("/", controllers.AddEmployeeLeaveDay)
				leaves.PUT("/", controllers.UpdateEmployeeLeaveDay)
				leaves.DELETE("/:empid/:lvid", controllers.DeleteEmployeeLeaveDay)
			}
			lvReq := emp.Group("/request").Use(svcs.CheckJWT("scheduler"))
			{
				lvReq.POST("/", controllers.CreateEmployeeLeaveRequest)
				lvReq.PUT("/", controllers.UpdateEmployeeLeaveRequest)
				lvReq.DELETE("/:empid/:reqid", controllers.DeleteEmployeeLeaveRequest)
			}
			lCode := emp.Group("/laborcode").Use(svcs.CheckJWT("scheduler"))
			{
				lCode.POST("/", controllers.AddEmployeeLaborCode)
				lCode.DELETE("/:empid/:asgmt/:chgno/:ext", controllers.DeleteEmployeeLaborCode)
			}
			emp.GET("/work/:employee/:year", controllers.GetEmployeeWork)
			emp.POST("/contact", controllers.UpdateContact)
			emp.POST("/specialty", controllers.UpdateSpecialty)
			emp.POST("/specialties", controllers.UpdateSpecialties)
		}
		site := api.Group("/site", svcs.CheckJWT("scheduler"))
		{
			site.GET("/:teamid/:siteid", controllers.GetSite)
			site.GET("/:teamid/:siteid/:employees", controllers.GetSite)
			site.POST("/", controllers.CreateSite,
				svcs.CheckRoles("scheduler", teamRoles))
			site.PUT("/", controllers.UpdateSite,
				svcs.CheckRoles("scheduler", siteRoles))
			site.DELETE("/:teamid/:siteid", controllers.DeleteSite,
				svcs.CheckRoles("scheduler", teamRoles))
			site.POST("/balances", controllers.AddSitesEmployeeLeaveBalances,
				svcs.CheckRoles("scheduler", siteRoles))

			wkctr := site.Group("/workcenter",
				svcs.CheckRoles("scheduler", siteRoles))
			{
				wkctr.POST("/", controllers.CreateWorkcenter)
				wkctr.PUT("/", controllers.UpdateWorkcenter)
				wkctr.DELETE("/:teamid/:siteid/:wkctrid",
					controllers.DeleteSiteWorkcenter)

				position := wkctr.Group("/position",
					svcs.CheckRoles("scheduler", siteRoles))
				{
					position.POST("/", controllers.CreateWorkcenterPosition)
					position.PUT("/", controllers.UpdateWorkcenterPosition)
					position.DELETE("/:teamid/:siteid/:wkctrid/:posid",
						controllers.DeleteWorkcenterPosition)
				}

				shifts := wkctr.Group("/shift",
					svcs.CheckRoles("scheduler", siteRoles))
				{
					shifts.POST("/", controllers.CreateWorkcenterShift)
					shifts.PUT("/", controllers.UpdateWorkcenterShift)
					shifts.DELETE("/:teamid/:siteid/:wkctrid/:shiftid",
						controllers.DeleteWorkcenterShift)
				}
			}

			rpt := site.Group("/forecast",
				svcs.CheckRoles("scheduler", siteRoles))
			{
				rpt.POST("/", controllers.CreateSiteForecastReport)
				rpt.PUT("/", controllers.UpdateSiteForecastReport)
				rpt.DELETE("/:teamid/:siteid/:rptid",
					controllers.DeleteSiteForecastReport)

				lCode := rpt.Group("/laborcode")
				{
					lCode.POST("/", controllers.CreateSiteLaborCode)
					lCode.PUT("/", controllers.UpdateSiteLaborCode)
					lCode.DELETE("/:teamid/:siteid/:reportid/:chgno/:ext",
						controllers.DeleteSiteLaborCode)
				}
			}

			cofs := site.Group("/cofs",
				svcs.CheckRoles("scheduler", siteRoles))
			{
				cofs.POST("/", controllers.CreateSiteCofSReport)
				cofs.PUT("/", controllers.UpdateSiteCofSReport)
				cofs.DELETE("/:teamid/:siteid/:rptid",
					controllers.DeleteCofSReport)
			}
			site.GET("/work/:teamid/:siteid/:year", controllers.GetSiteEmployeesWork)
		}

		team := api.Group("/team", svcs.CheckJWT("scheduler"))
		{
			team.GET("/:teamid", controllers.GetTeam)
			team.POST("/", svcs.CheckRoles("scheduler", teamRoles),
				controllers.CreateTeam)
			team.PUT("/", svcs.CheckRoles("scheduler", teamRoles),
				controllers.UpdateTeam)
			team.DELETE("/:teamid", svcs.CheckRoles("scheduler", teamRoles),
				controllers.DeleteTeam)
			wcode := team.Group("/workcode", svcs.CheckRoles("scheduler", teamRoles))
			{
				wcode.POST("/", controllers.CreateWorkcode)
				wcode.PUT("/", controllers.UpdateTeamWorkcode)
				wcode.DELETE("/:teamid/:wcid", controllers.DeleteTeamWorkcode)
			}
			comp := team.Group("/company", svcs.CheckRoles("scheduler", teamRoles))
			{
				comp.POST("/", controllers.CreateTeamCompany)
				comp.PUT("/", controllers.UpdateTeamCompany)
				comp.DELETE("/:teamid/:companyid", controllers.DeleteTeamCompany)

				holiday := comp.Group("/holiday")
				{
					holiday.POST("/", controllers.CreateCompanyHoliday)
					holiday.PUT("/", controllers.UpdateCompanyHoliday)
					holiday.DELETE("/:teamid/:companyid/:holidayid",
						controllers.DeleteCompanyHoliday)
				}
			}
			contact := team.Group("/contact", svcs.CheckRoles("scheduler", teamRoles))
			{
				contact.POST("/", controllers.CreateContactType)
				contact.PUT("/", controllers.ChangeContactType)
				contact.DELETE("/:teamid/:id", controllers.DeleteContactType)
			}
			specialty := team.Group("/specialty", svcs.CheckRoles("scheduler", teamRoles))
			{
				specialty.POST("/", controllers.CreateSpecialtyType)
				specialty.PUT("/", controllers.ChangeSpecialtyType)
				specialty.DELETE("/:teamid/:id", controllers.DeleteSpecialtyType)
			}
		}

		ingest := api.Group("/ingest", svcs.CheckJWT("scheduler"))
		{
			ingest.GET("/:teamid/:siteid/:company/:year",
				svcs.CheckRoles("scheduler", siteRoles),
				controllers.GetIngestEmployees)
			ingest.POST("/", svcs.CheckRoles("scheduler", siteRoles),
				controllers.IngestFiles)
			ingest.PUT("/", svcs.CheckRoles("scheduler", siteRoles),
				controllers.ManualIngestActions)
		}

		admin := api.Group("/admin", svcs.CheckJWT("scheduler"),
			svcs.CheckRole("scheduler", "admin"))
		{
			admin.GET("/teams", controllers.GetTeams)
			admin.DELETE("/teams/:teamid", controllers.DeleteTeam)
			admin.DELETE("/purge/:purge", controllers.Purge)
		}

		reports := api.Group("/reports", svcs.CheckJWT("scheduler"))
		{
			reports.POST("/", controllers.CreateReport)
		}

		notes := api.Group("/messages", svcs.CheckJWT("scheduler"))
		{
			notes.GET("/", controllers.GetAllMessages)
			notes.GET("/message/:id", controllers.GetMessage)
			notes.GET("/employee/:userid", controllers.GetMessagesForEmployee)
			notes.POST("/", controllers.CreateMessage)
			notes.PUT("/acknowledge", controllers.AcknowledgeMessages)
		}

		logs := api.Group("/logs", svcs.CheckJWT("scheduler"),
			svcs.CheckRoles("scheduler", roles))
		{
			logs.GET("/:portion/:year", controllers.GetLogEntries)
			logs.POST("/", controllers.AddLogEntry)
		}
	}

	// listen on port 6002
	router.Run(":6002")
}
