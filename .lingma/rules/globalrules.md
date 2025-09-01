---
trigger: always_on
---
{
  "ai_ide_development_rules": {
    "context_management": {
      "use_context_7_mcp": "Always use context 7 MCP when appropriate",
      "context_7_use_cases": [
        "implementing new features or components",
        "refactoring existing code",
        "debugging complex issues",
        "documenting system architecture",
        "creating technical specifications",
        "analyzing code dependencies and relationships"
      ]
    },
    "terminal_commands": {
      "execution_format": "cd <the directory> && <command>",
      "description": "Always change to the appropriate directory before executing commands"
    },
    "development_workflow": {
      "process": [
        "file_edit",
        "run_tests",
        "evaluate_test_results",
        "update_documentation",
        "commit_and_push"
      ],
      "test_handling": {
        "if_tests_pass": "Proceed to documentation update",
        "if_tests_fail": {
          "steps": [
            "diagnose_problem",
            "list_solutions",
            "choose_best_solution"
          ],
          "solution_selection": "Do not use the path of least resistance when choosing the best solution"
        }
      }
    },
    "version_control": {
      "branch_creation": "Always take permission before creating a new branch",
      "commit_messages": "Always use meaningful commit messages",
      "required_actions": [
        "commit",
        "push_to_github_repo"
      ]
    },
    "documentation_standards": {
      "format": "markdown",
      "update_requirement": "Update necessary documentation after successful tests"
    },
    "code_standards": {
      "commenting": "Always use code comments where applicable",
      "readability": "Maintain clear and documented code"
    },
    "quality_assurance": {
      "testing_priority": "Run tests before proceeding with workflow",
      "problem_solving": "Thorough diagnosis and solution evaluation required",
      "no_shortcuts": "Avoid path of least resistance for critical decisions",
      "test_integrity": "NEVER modify tests to make them pass - always fix the actual code implementation"
    },
    "project_structure": {
      "directory_management": "Folders and directories are equivalent terms",
      "context_awareness": "Maintain awareness of project root and directory structure"
    }
  }
}

